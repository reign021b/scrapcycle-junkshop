import React from "react";
import Image from "next/image";

export const AddItemModal = ({
  isOpen,
  onClose,
  selectedType,
  newItemData,
  onSubmit,
  onChange,
  branches = [], // Add branches as a prop
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 border">
        <h2 className="text-xl text-center font-semibold mb-4">Add New Item</h2>
        <form onSubmit={onSubmit}>
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
              onChange={onChange}
              className="mt-1 block w-full p-2 rounded-md border shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <select
              name="branch"
              value={newItemData.branch}
              onChange={onChange}
              className="mt-1 block w-full p-2 rounded-md border shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Price (₱)
            </label>
            <input
              type="number"
              name="price"
              value={newItemData.price}
              onChange={onChange}
              className="mt-1 block w-full p-2 rounded-md border shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Goal Quantity
            </label>
            <input
              type="text"
              name="goalQuantity"
              value={newItemData.goalQuantity}
              onChange={onChange}
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
              onChange={onChange}
              className="mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border p-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const GoalItemModal = ({
  isOpen,
  onClose,
  selectedItem,
  formData,
  onChange,
  onSubmit,
}) => {
  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-1/5 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
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
        <form onSubmit={onSubmit}>
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
              onChange={onChange}
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
              onChange={onChange}
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
  );
};
