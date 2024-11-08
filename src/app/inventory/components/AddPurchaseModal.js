"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "/utils/supabase/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Icons
import { BiPurchaseTag } from "react-icons/bi";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { LuPlus } from "react-icons/lu";

const AddPurchaseModal = ({ isOpen, onClose }) => {
  // Dropoff information
  const [branches, setBranches] = useState([]);
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
  const [typeOptions, setTypeOptions] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  // Helper function to parse price string
  const parsePriceString = (priceString) => {
    // Remove any spaces and split by '/'
    const [price, unit] = priceString
      .trim()
      .split("/")
      .map((s) => s.trim());
    // Convert price to float and remove any non-numeric characters except decimal point
    const numericPrice = parseFloat(price.replace(/[^\d.]/g, ""));
    return {
      price: numericPrice,
      unit: unit, // 'kg', 'piece', or 'case'
    };
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // Retrieve the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) throw new Error("No user session found");

        const userId = session.user.id;

        // Fetch the operator data to get the junkshop_id
        const { data: operatorData, error: operatorError } = await supabase
          .from("operators")
          .select("junkshop_id")
          .eq("id", userId)
          .single();

        if (operatorError) throw operatorError;

        const { junkshop_id } = operatorData;
        setJunkshopId(junkshop_id);

        // Fetch the branches of the junkshop
        const { data: junkshopData, error: junkshopError } = await supabase
          .from("junkshops")
          .select("branches")
          .eq("id", junkshop_id)
          .single();

        if (junkshopError) throw junkshopError;

        setBranches(junkshopData.branches);
      } catch (error) {
        console.error("Error fetching branches:", error.message);
      }
    };

    const fetchTypeOptions = async () => {
      try {
        const { data, error } = await supabase.from("prices").select("type");

        if (error) throw error;

        // Use a Set to filter out duplicates
        const uniqueTypes = [...new Set(data.map((item) => item.type))];
        setTypeOptions(uniqueTypes);
      } catch (error) {
        console.error("Error fetching type options:", error.message);
      }
    };

    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("prices")
          .select("itemName, price, type, commission");

        if (error) throw error;

        // Process the items to parse price strings
        const processedData = data.map((item) => {
          const { price, unit } = parsePriceString(item.price);
          return {
            ...item,
            price,
            unit,
            commission: item.commission || 0,
          };
        });

        setAllItems(processedData);

        // Get unique types
        const uniqueTypes = [
          ...new Set(processedData.map((item) => item.type)),
        ];
        setTypeOptions(uniqueTypes);

        // Initially filter items based on selected type (if any)
        if (itemInput.type) {
          const filtered = processedData.filter(
            (item) => item.type === itemInput.type
          );
          setFilteredItems(filtered);
        } else {
          setFilteredItems([]);
        }
      } catch (error) {
        console.error("Error fetching items:", error.message);
      }
    };

    if (isOpen) {
      fetchBranches();
      fetchTypeOptions();
      fetchItems();
    }
  }, [isOpen]);

  const handleTypeChange = (selectedType) => {
    setItemInput({
      ...itemInput,
      type: selectedType,
      item: "", // Reset item selection when type changes
      price: 0,
      unit: "",
    });

    const filtered = allItems.filter((item) => item.type === selectedType);
    setFilteredItems(filtered);
  };

  // Update item details when item is selected
  const handleItemChange = (selectedItemName) => {
    const selectedItem = filteredItems.find(
      (item) => item.itemName === selectedItemName
    );
    if (selectedItem) {
      setItemInput({
        ...itemInput,
        item: selectedItem.itemName,
        price: selectedItem.price,
        unit: selectedItem.unit,
        commission: selectedItem.commission || 0,
      });
    }
  };

  const handleAddItem = () => {
    // Check if Type and Item are not empty or null
    if (!itemInput.type || !itemInput.item) {
      toast.error("Please choose Type and Item first.");
      return;
    }

    // Check if Quantity is greater than zero
    if (itemInput.quantity > 0) {
      const totalCommission = itemInput.commission * itemInput.quantity; // Calculate total commission
      setItems([
        ...items,
        {
          ...itemInput,
          total: itemInput.price * itemInput.quantity,
          totalCommission, // Store the total commission
        },
      ]);
      setItemInput({
        type: "",
        item: "",
        price: 0,
        unit: "",
        quantity: 0,
        commission: 0,
      });
      setFilteredItems([]);
    } else {
      toast.error("Quantity should not be zero.");
    }
  };

  // Save the dropoff and all items
  const handleSavePurchase = async () => {
    // Validate dropoff fields
    if (
      !seller?.trim() ||
      !contact?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !junkshop_id
    ) {
      toast.error("Please fill in all dropoff details.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Validate items array
    if (!items.length) {
      toast.error("Please add at least one item", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Validate each item in the items array
    const invalidItems = items.filter(
      (item) =>
        !item.type?.trim() ||
        !item.item?.trim() ||
        !item.price ||
        !item.unit?.trim() ||
        !item.quantity ||
        !item.total ||
        item.commission === undefined
    );

    if (invalidItems.length > 0) {
      toast.error("Please fill in all details for each item", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Show loading toast
    const toastId = toast.loading("Saving purchase...", {
      position: "top-right",
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    try {
      // Insert into dropoffs table
      const { data: dropoffData, error: dropoffError } = await supabase
        .from("dropoffs")
        .insert({
          seller: seller.trim(),
          contact: contact.trim(),
          address: address.trim(),
          city: city.trim(),
          junkshop_id,
        })
        .select("*")
        .single();

      if (dropoffError) throw dropoffError;

      // Prepare items data for collectedItems table
      const collectedItemsData = items.map((item) => ({
        dropoff_id: dropoffData.id,
        type: item.type.trim(),
        item: item.item.trim(),
        price: Number(item.price),
        unit: item.unit.trim(),
        quantity: Number(item.quantity),
        total: Number(item.total),
        commission: Number(item.totalCommission),
        confirmed: false,
      }));

      // Insert items into collectedItems table
      const { error: collectedItemsError } = await supabase
        .from("collectedItems")
        .insert(collectedItemsData);

      if (collectedItemsError) throw collectedItemsError;

      // Update loading toast to success
      toast.update(toastId, {
        render: "Purchase saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
        draggable: true,
      });

      onClose(); // Close modal after saving
      clearForm(); // Clear form inputs
    } catch (error) {
      // Update loading toast to error
      toast.update(toastId, {
        render: `Error saving purchase: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeOnClick: true,
        draggable: true,
      });
      console.error("Error saving purchase:", error.message);
    }
  };

  // Helper function to clear all form inputs
  const clearForm = () => {
    setSeller("");
    setContact("");
    setAddress("");
    setCity("");
    setItemInput({
      type: "",
      item: "",
      price: 0,
      unit: "",
      quantity: 0,
      commission: 0,
    });
    setItems([]);
    setFilteredItems([]);
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="text-sm">
        <ToastContainer />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <div className="flex items-start justify-center text-3xl my-5">
          <p className="text-2xl font-semibold mb-4">ADD PURCHASE</p>
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
                className="w-full border border-gray-300 text-sm rounded-lg p-2"
                value={seller}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Allow only letters and spaces
                  if (/^[A-Za-z\s]*$/.test(newValue)) {
                    setSeller(newValue);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact No.
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 text-sm rounded-lg p-2"
                value={contact}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Allow numbers and optional leading plus sign
                  if (/^\+?\d*$/.test(newValue)) {
                    setContact(newValue);
                  }
                }}
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
                className="w-full border border-gray-300 text-sm rounded-lg p-2"
                value={address}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Allow letters, numbers, spaces, hyphens, and commas
                  if (/^[A-Za-z0-9\s,-]*$/.test(newValue)) {
                    setAddress(newValue);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <select
                className="w-full border text-sm border-gray-300 rounded-lg p-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="" disabled>
                  Select a city
                </option>
                {branches.map((branch, index) => (
                  <option key={index} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Single Item Input */}
        <h3 className="text-lg font-medium mt-8 text-center">ADD ITEMS</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Item Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                value={itemInput.type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="">Select Item Type</option>
                {typeOptions.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Item
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                value={itemInput.itemName}
                onChange={(e) => handleItemChange(e.target.value)}
                disabled={!itemInput.type}
              >
                <option value="">Select Item</option>
                {filteredItems.map((item, index) => (
                  <option key={index} value={item.itemName}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                value={itemInput.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  // Only allow positive values or zero
                  if (value >= 0 || e.target.value === "") {
                    setItemInput({
                      ...itemInput,
                      price: value,
                    });
                  }
                }}
                min="0" // Adds a minimum constraint to prevent negative values with arrows
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 text-sm cursor-not-allowed bg-gray-50"
                value={itemInput.unit}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                placeholder="0" // Placeholder will show '0' when input is empty
                value={itemInput.quantity || ""} // If quantity is empty, the input will be blank
                onChange={(e) => {
                  const quantity =
                    itemInput.unit === "kg"
                      ? parseFloat(e.target.value)
                      : parseInt(e.target.value);

                  // Only allow positive values or empty string
                  if (
                    (quantity >= 0 || e.target.value === "") &&
                    !isNaN(quantity)
                  ) {
                    setItemInput({
                      ...itemInput,
                      quantity: quantity,
                    });
                  }
                }}
                min="0" // Adds a minimum constraint to prevent negative values with arrows
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAddItem}
              className="pl-2 pr-3 py-1 bg-green-600 text-sm text-white rounded-lg hover:bg-green-700 mt-4"
            >
              <div className="flex items-center ">
                <span className="text-lg">
                  <LuPlus />
                </span>
                <div>Add Item</div>
              </div>
            </button>
          </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <>
            <h3 className="text-lg font-medium mt-6">Items List</h3>
            <ul className="list-disc ml-5 mt-2 space-y-2">
              {items.map((item, index) => (
                <li key={index} className="text-gray-700 flex items-center">
                  <span>
                    • {item.item} - {item.quantity} {item.unit} @ ₱{item.price}{" "}
                    = ₱{item.total}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="ml-4 text-lg text-red-600 p-1 rounded-lg hover:text-red-700"
                  >
                    <IoIosCloseCircleOutline />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 mt-6 text-sm">
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
