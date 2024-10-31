// AddPurchaseModal.js
"use client";

import React, { useState } from "react";
import { supabase } from "/utils/supabase/client";

// Icons
import { BiPurchaseTag } from "react-icons/bi";

const AddPurchaseModal = ({ isOpen, onClose }) => {
  // Dropoff information
  const [seller, setSeller] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [junkshop_id, setJunkshopId] = useState("");

  // Single item input and items list
  const [itemInput, setItemInput] = useState({
    type: "",
    item: "",
    price: 0,
    unit: "",
    quantity: 0,
    commission: 0,
  });
  const [items, setItems] = useState([]);

  // Add current item to the items list
  const handleAddItem = () => {
    setItems([
      ...items,
      { ...itemInput, total: itemInput.price * itemInput.quantity },
    ]);
    setItemInput({
      type: "",
      item: "",
      price: 0,
      unit: "",
      quantity: 0,
      commission: 0,
    });
  };

  // Save the dropoff and all items
  const handleSavePurchase = async () => {
    try {
      // Insert into dropoffs table
      const { data: dropoffData, error: dropoffError } = await supabase
        .from("dropoffs")
        .insert({
          seller,
          contact,
          address,
          city,
          junkshop_id,
        })
        .select("*")
        .single();

      if (dropoffError) throw dropoffError;

      // Prepare items data for collectedItems table
      const collectedItemsData = items.map((item) => ({
        dropoff_id: dropoffData.id,
        type: item.type,
        item: item.item,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        total: item.total,
        commission: item.commission,
        confirmed: false,
      }));

      // Insert items into collectedItems table
      const { error: collectedItemsError } = await supabase
        .from("collectedItems")
        .insert(collectedItemsData);

      if (collectedItemsError) throw collectedItemsError;

      onClose(); // Close modal after saving
    } catch (error) {
      console.error("Error saving purchase:", error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div className="flex items-start justify-center text-3xl my-5">
          <div className="pt-1 mr-1">
            <BiPurchaseTag />
          </div>
          <p className="text-2xl font-semibold mb-4">Add Purchase</p>
        </div>

        {/* Dropoff Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Seller
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Single Item Input */}
        <h3 className="text-lg font-medium mt-8 text-center">ADD ITEMS</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={itemInput.type}
                onChange={(e) =>
                  setItemInput({ ...itemInput, type: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Item
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={itemInput.item}
                onChange={(e) =>
                  setItemInput({ ...itemInput, item: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={itemInput.price}
                onChange={(e) =>
                  setItemInput({
                    ...itemInput,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={itemInput.unit}
                onChange={(e) =>
                  setItemInput({ ...itemInput, unit: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={itemInput.quantity}
                onChange={(e) =>
                  setItemInput({
                    ...itemInput,
                    quantity: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-4"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <>
            <h3 className="text-lg font-medium mt-6">Items List</h3>
            <ul className="list-disc ml-5 mt-2 space-y-2">
              {items.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item.item} - {item.quantity} {item.unit} @ ₱{item.price} = ₱
                  {item.total}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePurchase}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPurchaseModal;
