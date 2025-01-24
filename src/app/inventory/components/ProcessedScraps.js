import React, { useState, useEffect } from "react";
import { supabase } from "/utils/supabase/client";
import { AddItemModal, GoalItemModal } from "./modals/ItemModal";
import TypeSection from "./TypeSection";

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
  const [processedItems, setProcessedItems] = useState([]);

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

        // Fetch all processed items
        const { data: processedData, error: processedError } = await supabase
          .from("processeditems")
          .select("*");

        if (processedError) throw processedError;

        setProcessedItems(processedData);
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

    if (junkshopId) {
      fetchData();
    }
  }, [junkshopId]);

  const getProcessedQuantity = (itemName, branch) => {
    const filteredItems = processedItems.filter(
      (p) =>
        p.item.toLowerCase() === itemName.toLowerCase() &&
        p.branch === branch &&
        p.junkshop_id === junkshopId
    );

    const total = filteredItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      return sum + quantity;
    }, 0);

    return total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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

    const { error } = await supabase
      .from("itemgoals")
      .insert([insertData])
      .select();

    if (error) {
      console.error("Error adding new item:", error);
      alert(`Failed to add item: ${error.message}`);
      return;
    }

    // Refetch data
    try {
      const { data: items, error: itemsError } = await supabase.rpc(
        "get_itemgoals_for_inventory"
      );

      if (itemsError) throw itemsError;

      // Fetch processed items
      const { data: processedData, error: processedError } = await supabase
        .from("processeditems")
        .select("*");

      if (processedError) throw processedError;

      // Reconstruct grouped items
      const initialGroups = itemTypes.reduce((acc, { id, name }) => {
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

      setProcessedItems(processedData);
      setGroupedItems(groupedData);
    } catch (error) {
      console.error("Error refetching data:", error);
    }

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

    // Refetch data
    try {
      const { data: items, error: itemsError } = await supabase.rpc(
        "get_itemgoals_for_inventory"
      );

      if (itemsError) throw itemsError;

      // Fetch processed items
      const { data: processedData, error: processedError } = await supabase
        .from("processeditems")
        .select("*");

      if (processedError) throw processedError;

      // Reconstruct grouped items
      const initialGroups = itemTypes.reduce((acc, { id, name }) => {
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

      setProcessedItems(processedData);
      setGroupedItems(groupedData);
    } catch (error) {
      console.error("Error refetching data:", error);
    }

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
          <TypeSection
            key={type.id}
            type={type}
            isCollapsed={collapsedStates[type.name.toLowerCase()]}
            onToggle={() => handleToggleCollapse(type.name.toLowerCase())}
            onAddItem={handleAddItemClick}
            items={groupedItems[type.name.toLowerCase()]?.items}
            onItemClick={handleItemClick}
            junkshopId={junkshopId}
            processedItems={processedItems}
          />
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
