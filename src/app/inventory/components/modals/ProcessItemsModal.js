import React, { useState, useEffect } from "react";
import { supabase } from "/utils/supabase/client";

const ProcessItemsModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    branch: "",
  });
  const [branches, setBranches] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [itemType, setItemType] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await supabase
        .from("itemgoals")
        .select(
          `
          item,
          type,
          itemtypes (
            name
          )
        `
        )
        .order("item");

      const uniqueItems = Array.from(
        new Set(data.map((item) => item.item))
      ).map((item) => {
        const itemData = data.find((d) => d.item === item);
        return {
          name: item,
          type: itemData.type,
          typeName: itemData.itemtypes.name,
        };
      });

      setItems(uniqueItems);
      setFilteredItems(uniqueItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: operatorData } = await supabase
        .from("operators")
        .select("junkshop_id")
        .eq("id", session.user.id)
        .single();

      if (!operatorData) return;

      const { data: junkshopData } = await supabase
        .from("junkshops")
        .select("branches")
        .eq("id", operatorData.junkshop_id)
        .single();

      if (junkshopData?.branches) {
        setBranches(junkshopData.branches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleItemSearch = (searchTerm) => {
    setFormData((prev) => ({ ...prev, item: searchTerm }));
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
    setIsDropdownOpen(true);
  };

  const handleItemSelect = (selectedItem) => {
    setFormData((prev) => ({ ...prev, item: selectedItem.name }));
    setItemType(selectedItem.typeName);
    setIsDropdownOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!items.some((item) => item.name === formData.item)) {
      newErrors.item = "Please select a valid item from the list";
    }

    const quantityNum = parseFloat(formData.quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      newErrors.quantity =
        "Quantity must be a number greater than or equal to 1";
    }

    if (!formData.branch) {
      newErrors.branch = "Please select a branch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data: operatorData } = await supabase
        .from("operators")
        .select("junkshop_id")
        .eq("id", session.user.id)
        .single();

      const selectedItemData = items.find(
        (item) => item.name === formData.item
      );

      const { error } = await supabase.from("processeditems").insert({
        item: formData.item,
        quantity: parseFloat(formData.quantity),
        date_added: new Date().toISOString(),
        junkshop_id: operatorData.junkshop_id,
        branch: formData.branch,
        type: selectedItemData.type,
      });

      if (error) throw error;
      onClose();
      setFormData({ item: "", quantity: "", branch: "" });
      setItemType("");
    } catch (error) {
      console.error("Error inserting processed item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ item: "", quantity: "", branch: "" });
    setItemType("");
    setErrors({});
    setIsDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Process New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">
              Item Name
              <input
                type="text"
                value={formData.item}
                onChange={(e) => handleItemSearch(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                className={`mt-1 block w-full rounded-md border p-2 ${
                  errors.item ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleItemSelect(item)}
                  >
                    {item.name
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}{" "}
                  </div>
                ))}
              </div>
            )}
            {errors.item && (
              <p className="text-red-500 text-xs mt-1">{errors.item}</p>
            )}
          </div>

          {itemType && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Item Type
                <input
                  type="text"
                  value={itemType}
                  readOnly
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-gray-50"
                />
              </label>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Quantity
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value > 0 || e.target.value === "") {
                    setFormData((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }));
                  }
                }}
                step="0.01"
                className={`mt-1 block w-full rounded-md border p-2 ${
                  errors.quantity ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Branch
              <select
                value={formData.branch}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, branch: e.target.value }))
                }
                className={`mt-1 block w-full rounded-md border p-2 ${
                  errors.branch ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Branch</option>
                {branches.map((branch, index) => (
                  <option key={index} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </label>
            {errors.branch && (
              <p className="text-red-500 text-xs mt-1">{errors.branch}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#27AE60] text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessItemsModal;
