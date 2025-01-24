import React, { useState } from "react";
import { LuPlus, LuTrash2, LuX } from "react-icons/lu";

const NewShipmentModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [buyer, setBuyer] = useState("");
  const [destination, setDestination] = useState("");
  const [items, setItems] = useState([{ item: "", price: "", quantity: "" }]);

  const addItemRow = () => {
    setItems([...items, { item: "", price: "", quantity: "" }]);
  };

  const removeItemRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Submitting:", { buyer, destination, items });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="bg-[#27AE60] text-white pl-4 pr-3 py-[6px] font-[450] text-sm flex items-center rounded-lg cursor-pointer"
      >
        <div className="mr-2 text-sm">Insert</div>
        <div className="text-xl text-white flex items-center">
          <LuPlus />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-[700px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <LuX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl text-center font-bold mb-6">New Shipment</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="buyer"
            >
              Buyer
            </label>
            <input
              id="buyer"
              type="text"
              placeholder="Enter buyer name"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              className="font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="destination"
            >
              Destination
            </label>
            <input
              id="destination"
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Items</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100"
              >
                <LuPlus className="mr-2" /> Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Item"
                  value={item.item}
                  onChange={(e) => updateItem(index, "item", e.target.value)}
                  className="font-normal flex-1 appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  className="font-normal w-32 appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", e.target.value)
                  }
                  className="font-normal w-32 appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <LuTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-green-700"
            >
              Save Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewShipmentModal;
