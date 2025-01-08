import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "/utils/supabase/client";
import { LiaGreaterThanSolid, LiaEqualsSolid } from "react-icons/lia";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import { AddItemModal, GoalItemModal } from "./modals/ItemModal";

export default function ProcessedScraps() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isGoalItemModalOpen, setIsGoalItemModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pricePerQuantity: "",
    goalQuantity: "",
  });
  const [newItemData, setNewItemData] = useState({
    item: "",
    typeId: "",
    typeName: "",
    goalQuantity: "",
    image: "",
    branch: "",
    price: "",
    junkshop_id: "",
  });
  const [collapsedStates, setCollapsedStates] = useState({});
  const [groupedItems, setGroupedItems] = useState({});
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [junkshopId, setJunkshopId] = useState(null);
  const [branches, setBranches] = useState([]);

  const handleImageUpload = (imageUrl) => {
    setNewItemData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: operatorData, error: operatorError } = await supabase
          .from("operators")
          .select("id, junkshop_id")
          .eq("id", user.id)
          .single();

        if (operatorError) throw operatorError;

        const junkshopId = operatorData.junkshop_id;
        setJunkshopId(junkshopId);
        setNewItemData((prev) => ({ ...prev, junkshop_id: junkshopId }));

        const { data: junkshopData, error: junkshopError } = await supabase
          .from("junkshops")
          .select("branches")
          .eq("id", junkshopId)
          .single();

        if (junkshopError) throw junkshopError;

        setBranches(junkshopData.branches || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: types, error: typesError } = await supabase
          .from("itemtypes")
          .select("id, name");

        if (typesError) throw typesError;

        const { data: items, error: itemsError } = await supabase.rpc(
          "get_itemgoals_for_inventory"
        );

        if (itemsError) throw itemsError;

        setItemTypes(types);

        const initialGroups = types.reduce((acc, { id, name }) => {
          acc[name.toLowerCase()] = { id, items: [] };
          return acc;
        }, {});

        const groupedData = items.reduce((acc, item) => {
          const type = item.type.toLowerCase();
          if (acc.hasOwnProperty(type)) {
            acc[type].items.push(item);
          }
          return acc;
        }, initialGroups);

        setGroupedItems(groupedData);

        const initialCollapsedStates = types.reduce((acc, { name }) => {
          acc[name.toLowerCase()] = true;
          return acc;
        }, {});
        setCollapsedStates(initialCollapsedStates);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddItemClick = (typeName) => {
    const typeData = itemTypes.find(
      (t) => t.name.toLowerCase() === typeName.toLowerCase()
    );
    if (typeData) {
      setNewItemData((prev) => ({
        ...prev,
        typeId: typeData.id,
        typeName: typeData.name,
      }));
      setSelectedType(typeData);
      setIsAddItemModalOpen(true);
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();

    const insertData = {
      type: parseInt(newItemData.typeId),
      item: newItemData.item.toLowerCase(),
      goal_quantity: newItemData.goalQuantity,
      image: newItemData.image,
      junkshop_id: newItemData.junkshop_id,
      branch: newItemData.branch,
      price: newItemData.price,
    };

    console.log("Inserting data:", insertData);

    const { data, error } = await supabase
      .from("itemgoals")
      .insert([insertData])
      .select();

    if (error) {
      console.error("Error adding new item:", error);
      alert(`Failed to add item: ${error.message}`);
      return;
    }

    setGroupedItems((prev) => ({
      ...prev,
      [newItemData.typeName.toLowerCase()]: {
        ...prev[newItemData.typeName.toLowerCase()],
        items: [...prev[newItemData.typeName.toLowerCase()].items, data[0]],
      },
    }));

    setIsAddItemModalOpen(false);
    setNewItemData({
      item: "",
      typeId: "",
      typeName: "",
      goalQuantity: "",
      image: "",
      branch: "",
      price: "",
      junkshop_id: junkshopId,
    });
    setSelectedType(null);
  };

  const handleToggleCollapse = (type) => {
    setCollapsedStates((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleItemClick = (item) => {
    const typeName =
      itemTypes.find((type) => type.id === item.type)?.name || "";

    setSelectedItem({
      ...item,
      typeName,
    });
    setFormData({
      pricePerQuantity: item.price || "",
      goalQuantity: item.goal_quantity || "",
    });
    setIsGoalItemModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("itemgoals")
      .update({
        goal_quantity: formData.goalQuantity,
        price: formData.pricePerQuantity,
      })
      .eq("id", selectedItem.id);

    if (error) {
      console.error("Error updating goal:", error);
      return;
    }

    setGroupedItems((prev) => {
      const updated = { ...prev };
      if (updated[selectedItem.type]) {
        updated[selectedItem.type] = updated[selectedItem.type].map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                goal_quantity: formData.goalQuantity,
                price: formData.pricePerQuantity,
              }
            : item
        );
      }
      return updated;
    });

    setIsGoalItemModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-[354px] h-[79vh] bg-white rounded-2xl border-[0.5px] relative">
      <div>
        <p className="p-6 ml-1 font-[500] text-[1.25rem]">
          All Processed Scraps
        </p>
      </div>

      <div className="h-[70vh] overflow-y-auto">
        {itemTypes.map((type) => (
          <div key={type.id} className="mb-2">
            <div
              className={`flex bg-green-50 justify-between ${
                !collapsedStates[type.name.toLowerCase()]
                  ? "border-t-2 border-b-2 border-gray-200"
                  : ""
              }`}
            >
              <div
                className="px-6 py-3 flex items-center cursor-pointer"
                onClick={() => handleToggleCollapse(type.name.toLowerCase())}
              >
                {collapsedStates[type.name.toLowerCase()] ? (
                  <LiaGreaterThanSolid />
                ) : (
                  <LiaEqualsSolid />
                )}
                &nbsp; &nbsp;
                <p className="font-medium text-[1rem]">
                  {type.name.replace(/\b\w/g, (char) => char.toUpperCase())}
                </p>
              </div>
              <div
                className="text-[1.7rem] text-green-600 flex items-center px-5 cursor-pointer"
                onClick={() => handleAddItemClick(type.name)}
              >
                <BsFillPlusSquareFill />
              </div>
            </div>

            <div
              style={{
                maxHeight: collapsedStates[type.name.toLowerCase()]
                  ? "0"
                  : "1000px",
                overflow: "hidden",
                transition: "max-height 0.3s ease-in-out",
              }}
            >
              {!collapsedStates[type.name.toLowerCase()] &&
                (groupedItems[type.name.toLowerCase()]?.items?.length > 0 ? (
                  groupedItems[type.name.toLowerCase()].items.map((item) => (
                    <div
                      key={item.id}
                      className="pl-6 pr-3 py-2 mt-2 flex justify-between hover:border-gray-500 cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex">
                        <div>
                          <Image
                            src={item.image}
                            width={50}
                            height={50}
                            alt={item.item}
                          />
                        </div>
                        <div className="ml-3 items-center">
                          <p className="font-semibold">
                            {item.item.replace(/\b\w/g, (char) =>
                              char.toUpperCase()
                            )}
                          </p>
                          <p className="pt-1 font-[480] text-sm text-gray-500">
                            ₱ {item.price || 0} / kg
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center text-xs mb-2 justify-end">
                            <p>0 kg / {item.goal_quantity} kg</p>
                          </div>
                          <div className="flex items-end">
                            {[...Array(12)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-[16px] w-[5px] ${
                                  i < 0 ? "bg-green-600" : "bg-[#D9D9D9]"
                                } rounded-2xl ${i < 11 ? "mr-1" : ""}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div className="ml-2 text-gray-500 font-extralight">
                          <SlOptionsVertical />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pl-6 pr-3 py-4 text-gray-500 italic text-center">
                    No items in this category
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        selectedType={selectedType}
        newItemData={newItemData}
        onSubmit={handleAddItemSubmit}
        onChange={handleNewItemChange}
        onImageUpload={handleImageUpload}
        branches={branches}
      />

      <GoalItemModal
        isOpen={isGoalItemModalOpen}
        onClose={() => {
          setIsGoalItemModalOpen(false);
          setSelectedItem(null);
        }}
        selectedItem={selectedItem}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
