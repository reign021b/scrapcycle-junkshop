import React, { useState, useEffect } from "react";
import { LuX } from "react-icons/lu";
import { supabase } from "/utils/supabase/client";

const UpdateShipmentModal = ({ isOpen, onClose, shipmentId, onUpdate }) => {
  const [shipmentData, setShipmentData] = useState(null);
  const [shippedItems, setShippedItems] = useState([]);
  const [arrivalDate, setArrivalDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchShipmentData();
    }
  }, [isOpen, shipmentId]);

  const fetchShipmentData = async () => {
    try {
      setLoading(true);
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipmentLogs")
        .select("*")
        .eq("id", shipmentId)
        .single();

      if (shipmentError) throw shipmentError;

      const { data: items, error: itemsError } = await supabase
        .from("shippedItems")
        .select("*")
        .eq("shipment_id", shipmentId);

      if (itemsError) throw itemsError;

      const { data: itemGoals, error: itemGoalsError } = await supabase
        .from("itemgoals")
        .select("item, unit");

      if (itemGoalsError) throw itemGoalsError;

      const itemUnitsMap = Object.fromEntries(
        itemGoals.map((ig) => [ig.item, ig.unit])
      );

      const itemsWithUnits = items.map((item) => ({
        ...item,
        out_quan: item.out_quan || "",
        unit: itemUnitsMap[item.item] || "",
      }));

      setShipmentData(shipment);
      setShippedItems(itemsWithUnits);
    } catch (error) {
      console.error("Error fetching shipment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...shippedItems];
    newItems[index].out_quan = value;
    setShippedItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { error: shipmentError } = await supabase
        .from("shipmentLogs")
        .update({
          status: "DONE",
          arrival: arrivalDate,
        })
        .eq("id", shipmentId);

      if (shipmentError) throw shipmentError;

      const updatePromises = shippedItems.map((item) =>
        supabase
          .from("shippedItems")
          .update({ out_quan: item.out_quan })
          .eq("id", item.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter((result) => result.error);

      if (errors.length > 0) {
        throw errors[0];
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating shipment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !shipmentData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-[700px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <LuX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl text-black text-center font-bold mb-6">
          Update Shipment
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Departure Date
              </label>
              <input
                type="datetime-local"
                value={shipmentData.departure}
                className="text-base font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Arrival Date
              </label>
              <input
                type="datetime-local"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="text-base font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Buyer
              </label>
              <input
                type="text"
                value={shipmentData.buyer}
                className="text-base font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Branch
              </label>
              <input
                type="text"
                value={shipmentData.branch}
                className="text-base font-normal appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg text-black font-semibold mb-4">Items</h3>

            {/* Column Labels */}
            <div className="flex space-x-2 mb-2">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-bold">
                  Name
                </label>
              </div>
              <div className="w-40">
                <label className="block text-gray-700 text-sm font-bold">
                  Price
                </label>
              </div>
              <div className="w-32">
                <label className="block text-gray-700 text-sm font-bold">
                  In-Quan
                </label>
              </div>
              <div className="w-32">
                <label className="block text-gray-700 text-sm font-bold">
                  Out-Quan
                </label>
              </div>
            </div>

            {/* Items List */}
            {shippedItems.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={item.item}
                  className="flex-1 text-base font-normal appearance-none border rounded-lg py-2 px-3 text-black bg-gray-50"
                  disabled
                />
                <input
                  type="text"
                  value={`₱${item.price} / ${item.unit}`}
                  className="w-40 text-base font-normal appearance-none border rounded-lg py-2 px-3 text-gray-700 bg-gray-50"
                  disabled
                />
                <div className="relative w-32">
                  <input
                    type="text"
                    value={`${item.in_quan} ${item.unit}`}
                    className="w-full text-base font-normal appearance-none border rounded-lg py-2 px-3 text-gray-700 bg-gray-50"
                    disabled
                  />
                </div>
                <div className="relative w-32">
                  <input
                    type="number"
                    placeholder={`Out Qty (${item.unit})`}
                    value={item.out_quan}
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                    className="w-full text-base font-normal appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-base px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-base px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
              disabled={loading}
            >
              {loading ? "Updating..." : "Complete Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateShipmentModal;
