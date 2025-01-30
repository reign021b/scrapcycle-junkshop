import React, { useState, useEffect, useRef } from "react";
import { LuPlus, LuTrash2, LuX } from "react-icons/lu";
import { supabase } from "/utils/supabase/client";

const NewShipmentModal = ({ onShipmentCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buyer, setBuyer] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [items, setItems] = useState([{ item: "", price: "", quantity: "" }]);
  const [availableItems, setAvailableItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [focusedInputIndex, setFocusedInputIndex] = useState(-1);
  const suggestionRefs = useRef([]);

  const resetForm = () => {
    setBuyer("");
    setDestination("");
    setDepartureDate("");
    setSelectedBranch("");
    setItems([{ item: "", price: "", quantity: "" }]);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    setFocusedInputIndex(-1);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: operatorData, error: operatorError } = await supabase
          .from("operators")
          .select("junkshop_id")
          .eq("id", user.id)
          .single();
        if (operatorError) throw operatorError;

        // Fetch branches
        const { data: junkshopData, error: junkshopError } = await supabase
          .from("junkshops")
          .select("branches")
          .eq("id", operatorData.junkshop_id)
          .single();
        if (junkshopError) throw junkshopError;

        setBranches(junkshopData.branches || []);

        // Fetch available items
        const { data: itemsData, error: itemsError } = await supabase
          .from("itemgoals")
          .select("item, price, unit")
          .eq("junkshop_id", operatorData.junkshop_id);
        if (itemsError) throw itemsError;

        setAvailableItems(itemsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleItemSearch = (value, index) => {
    updateItem(index, "item", value);
    if (value.trim() === "") {
      setSuggestions(availableItems);
      return;
    }

    const filtered = availableItems.filter((item) =>
      item.item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleInputFocus = (index) => {
    setFocusedInputIndex(index);
    setSuggestions(availableItems);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setFocusedInputIndex(-1);
      setSuggestions([]);
    }, 200);
  };

  const handleKeyDown = (e, index) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          const selectedItem = suggestions[activeSuggestionIndex];
          updateItem(index, "item", selectedItem.item);
          updateItem(
            index,
            "price",
            `${selectedItem.price} / ${selectedItem.unit}`
          );
          setSuggestions([]);
          setActiveSuggestionIndex(-1);
        }
        break;
      case "Escape":
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

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

  const calculateTotal = (price, quantity) => {
    const numericPrice = parseFloat(price.replace(/[₱,]/g, ""));
    const numericQuantity = parseFloat(quantity);
    return (numericPrice * numericQuantity).toString();
  };

  const handleSelectItem = (selectedItem, index) => {
    updateItem(index, "item", selectedItem.item);
    // Store both price and unit for display, but we'll strip the unit when saving
    updateItem(index, "price", `${selectedItem.price} / ${selectedItem.unit}`);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get user's junkshop_id
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: operatorData, error: operatorError } = await supabase
        .from("operators")
        .select("junkshop_id")
        .eq("id", user.id)
        .single();
      if (operatorError) throw operatorError;

      // Calculate capital (total of all items)
      const capital = items
        .reduce((sum, item) => {
          const total = calculateTotal(item.price, item.quantity);
          return sum + parseFloat(total);
        }, 0)
        .toString();

      // Insert shipment log with status
      const { data: shipmentLog, error: shipmentError } = await supabase
        .from("shipmentLogs")
        .insert([
          {
            departure: departureDate,
            buyer,
            destination,
            capital,
            junkshop_id: operatorData.junkshop_id,
            branch: selectedBranch,
            status: "ONGOING",
          },
        ])
        .select()
        .single();

      if (shipmentError) throw shipmentError;

      // Insert shipped items with price only (no unit)
      const shippedItems = items.map((item) => {
        // Extract only the price number before the "/"
        const priceOnly = item.price.split("/")[0].trim();

        return {
          shipment_id: shipmentLog.id,
          item: item.item,
          in_quan: item.quantity,
          price: priceOnly,
          total: calculateTotal(priceOnly, item.quantity),
        };
      });

      const { error: itemsError } = await supabase
        .from("shippedItems")
        .insert(shippedItems);

      if (itemsError) throw itemsError;

      onShipmentCreated();

      handleClose();
    } catch (error) {
      console.error("Error saving shipment:", error);
    }
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white pl-4 pr-3 py-2 font-medium text-sm flex items-center rounded-lg cursor-pointer hover:bg-green-700"
      >
        <span className="mr-2">Insert</span>
        <LuPlus className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-[700px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <LuX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl text-center font-bold mb-6">New Shipment</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Departure Date
              </label>
              <input
                type="datetime-local"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch, index) => (
                  <option key={index} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Buyer
              </label>
              <input
                type="text"
                placeholder="Enter buyer name"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                className="font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Destination
              </label>
              <input
                type="text"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Items</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100"
              >
                <LuPlus className="mr-2 w-4 h-4" /> Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={item.item}
                    onChange={(e) => handleItemSearch(e.target.value, index)}
                    onFocus={() => handleInputFocus(index)}
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-full font-normal appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  {focusedInputIndex === index && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {suggestions.map((suggestion, suggestionIndex) => (
                        <div
                          key={suggestion.item}
                          ref={(el) =>
                            (suggestionRefs.current[suggestionIndex] = el)
                          }
                          className={`px-3 py-2 cursor-pointer text-sm ${
                            suggestionIndex === activeSuggestionIndex
                              ? "bg-green-50 text-green-600"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleSelectItem(suggestion, index)}
                        >
                          {suggestion.item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Price"
                  value={item.price ? `₱${item.price}` : ""}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[₱,]/g, "");
                    updateItem(index, "price", numericValue);
                  }}
                  className="font-normal w-40 appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  required
                  readOnly={false}
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
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
