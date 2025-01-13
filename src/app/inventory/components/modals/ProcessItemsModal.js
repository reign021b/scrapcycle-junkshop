import React, { useState, useEffect } from "react";
import { supabase } from "/utils/supabase/client";

const ProcessItemsModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    branch: "",
  });
  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.item.trim() || !/^[a-zA-Z\s]+$/.test(formData.item)) {
      newErrors.item = "Item name must contain only letters and spaces";
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

      const { error } = await supabase.from("processeditems").insert({
        item: formData.item,
        quantity: parseFloat(formData.quantity),
        date_added: new Date().toISOString(),
        junkshop_id: operatorData.junkshop_id,
        branch: formData.branch,
      });

      if (error) throw error;
      onClose();
      setFormData({ item: "", quantity: "", branch: "" });
    } catch (error) {
      console.error("Error inserting processed item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-xl font-bold mb-4 text-center">
          Insert New Processed Item
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Item Name
              <input
                type="text"
                value={formData.item}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, item: e.target.value }))
                }
                className={`mt-1 block w-full rounded-md border p-2 ${
                  errors.item ? "border-red-500" : "border-gray-300"
                }`}
              />
            </label>
            {errors.item && (
              <p className="text-red-500 text-xs mt-1">{errors.item}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Quantity
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
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
              onClick={onClose}
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
