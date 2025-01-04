import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "/utils/supabase/client";
import { LiaGreaterThanSolid, LiaEqualsSolid } from "react-icons/lia";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";

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
  });
  const [collapsedStates, setCollapsedStates] = useState({});
  const [groupedItems, setGroupedItems] = useState({});
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

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

        setItemTypes(types); // Store the full type objects

        // Initialize groups with all types, including their IDs
        const initialGroups = types.reduce((acc, { id, name }) => {
          acc[name.toLowerCase()] = { id, items: [] };
          return acc;
        }, {});

        // Then populate with actual items
        const groupedData = items.reduce((acc, item) => {
          const type = item.type.toLowerCase();
          if (acc.hasOwnProperty(type)) {
            acc[type].items.push(item);
          }
          return acc;
        }, initialGroups);

        setGroupedItems(groupedData);

        // Initialize collapsed states for all types
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
      type: parseInt(newItemData.typeId), // Changed from type_id to type
      item: newItemData.item.toLowerCase(),
      goal_quantity: newItemData.goalQuantity, // This is already text in the table
      image: newItemData.image,
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

    // Update the local state with the new item
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

      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 border">
            <h2 className="text-xl text-center font-semibold mb-4">
              Add New Item
            </h2>
            <form onSubmit={handleAddItemSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <input
                  type="text"
                  value={selectedType?.name || ""}
                  className="mt-1 block w-full p-2 rounded-md border bg-gray-50 shadow-sm"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  name="item"
                  value={newItemData.item}
                  onChange={handleNewItemChange}
                  className="mt-1 block w-full p-2 rounded-md border shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Goal Quantity
                </label>
                <input
                  type="text" // Changed from number since the column is text
                  name="goalQuantity"
                  value={newItemData.goalQuantity}
                  onChange={handleNewItemChange}
                  className="mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={newItemData.image}
                  onChange={handleNewItemChange}
                  className="mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 border p-2 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isGoalItemModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-1/5 relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setIsGoalItemModalOpen(false);
                setSelectedItem(null);
              }}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-center">
              {`${selectedItem.type.replace(/\b\w/g, (char) =>
                char.toUpperCase()
              )} - ${selectedItem.item.replace(/\b\w/g, (char) =>
                char.toUpperCase()
              )}`}
            </h2>
            <div className="flex justify-center my-4">
              <Image
                src={selectedItem.image}
                width={80}
                height={80}
                alt={selectedItem.item}
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="pricePerQuantity"
                >
                  Price per kg
                </label>
                <input
                  type="number"
                  id="pricePerQuantity"
                  name="pricePerQuantity"
                  value={formData.pricePerQuantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter price per quantity"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="goalQuantity"
                >
                  Quantity Goal
                </label>
                <input
                  type="number"
                  id="goalQuantity"
                  name="goalQuantity"
                  value={formData.goalQuantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter goal quantity"
                  required
                  min="0"
                />
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="submit"
                  className="w-1/3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
