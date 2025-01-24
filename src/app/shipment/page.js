"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { LuFilter, LuPlus } from "react-icons/lu";
import { TbArrowsSort } from "react-icons/tb";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import { supabase } from "/utils/supabase/client";

const Shipment = () => {
  const [selectedStatus, setSelectedStatus] = useState("DONE");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Function to convert price strings to numbers
  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    // Remove the peso sign, commas, and spaces, then convert to float
    const numericString = priceString.replace(/[₱,\s]/g, "");
    const value = parseFloat(numericString);
    return isNaN(value) ? 0 : value;
  };

  // Calculate totals for a shipment based on its items
  const calculateShipmentTotals = (items) => {
    return items.reduce(
      (acc, item) => {
        const itemRevenue = parsePrice(item.out_quan) * parsePrice(item.price);
        const itemTotal = parsePrice(item.total);
        return {
          total: acc.total + itemTotal,
          revenue: acc.revenue + itemRevenue,
          capital:
            acc.capital + parsePrice(item.in_quan) * parsePrice(item.price),
        };
      },
      { capital: 0, total: 0, revenue: 0 }
    );
  };

  const fetchShipments = async () => {
    try {
      // Fetch shipment logs
      const { data: shipmentLogs, error: shipmentError } = await supabase
        .from("shipmentLogs")
        .select("*")
        .order("shipping_date", { ascending: false });

      if (shipmentError) throw shipmentError;

      // Fetch items for each shipment
      const shipmentsWithItems = await Promise.all(
        shipmentLogs.map(async (shipment) => {
          const { data: items, error: itemsError } = await supabase
            .from("shippedItems")
            .select("*")
            .eq("shipment_id", shipment.id);

          if (itemsError) throw itemsError;

          const totals = calculateShipmentTotals(items || []);

          return {
            ...shipment,
            items: items || [],
            calculatedCapital: totals.capital,
            calculatedTotal: totals.total,
            calculatedRevenue: totals.revenue,
            calculatedDiff:
              totals.revenue > 0 ? totals.revenue - totals.capital : null,
          };
        })
      );

      setShipments(shipmentsWithItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₱ 0.00";
    return `₱ ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "DONE":
        return {
          badge: "bg-[#D9FFE9] text-[#27AE60]",
          row: "bg-[#EDFFF4]",
        };
      case "ONGOING":
        return {
          badge: "bg-yellow-100 text-yellow-600",
          row: "bg-yellow-50",
        };
      case "CANCELLED":
        return {
          badge: "bg-red-100 text-red-600",
          row: "bg-red-50",
        };
      default:
        return {
          badge: "",
          row: "bg-white",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 w-screen h-screen m-auto justify-center items-center bg-white">
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="w-full bg-gray-50 h-[91vh] mx-auto">
        <div className="max-w-[1340px] mx-auto">
          <p className="text-[1.6rem] font-semibold pt-5 pl-8">
            Sales & Shipment
          </p>
          <p className="text-sm text-[#828282] font-semibold pl-8">
            Purchases / Inventory
          </p>
        </div>
        <div className="max-w-[1340px] h-[78.5vh] mt-6 mx-auto bg-white rounded-2xl border-[1.5px]">
          <div className="px-6 pt-5 pb-2 flex justify-between">
            <div className="text-lg font-bold">Shipment Logs</div>
            <div className="flex text-xs items-center pb-2">
              {["DONE", "ONGOING", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`mr-14 ${
                    selectedStatus === status
                      ? status === "DONE"
                        ? "text-green-600 font-[800]"
                        : status === "ONGOING"
                        ? "text-yellow-500 font-[800]"
                        : "text-red-500 font-[800]"
                      : "text-gray-700"
                  } ${status === "CANCELLED" ? "mr-0" : ""}`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center font-medium">
              <div className="relative">
                <div className="mr-8 flex items-center font-medium cursor-pointer p-2 rounded-xl">
                  <span className="text-lg">
                    <LuFilter />
                  </span>
                  <div className="ml-2 text-sm">Filter</div>
                </div>
              </div>
              <div className="mr-8 flex items-center font-medium cursor-pointer">
                <span className="text-lg">
                  <TbArrowsSort />
                </span>
                <div className="ml-2 text-sm">Sort by</div>
              </div>
              <div className="mr-6 border-[0.5px] border-r-0 h-10"></div>
              <div className="bg-[#27AE60] text-white pl-4 pr-3 py-[6px] font-[450] text-sm flex items-center rounded-lg cursor-pointer">
                <div className="mr-2 text-sm">Insert</div>
                <div className="text-xl text-white flex items-center">
                  <LuPlus />
                </div>
              </div>
            </div>
          </div>

          {/* Column Title */}
          <div className="grid grid-cols-9 pl-6 text-xs text-gray-500 bg-[#FCFCFC] border border-x-0 py-4 pr-6">
            <div>SHIPMENT ID</div>
            <div>BUYER</div>
            <div>DESTINATION</div>
            <div>DEPARTURE</div>
            <div>ARRIVAL</div>
            <div>CAPITAL</div>
            <div>REVENUE</div>
            <div>DIFF</div>
            <div className="justify-center items-center flex">
              <div>STATUS</div>
              <div className="ml-12"></div>
            </div>
          </div>

          {/* Rows of Data */}
          {shipments
            .filter(
              (shipment) =>
                selectedStatus === "ALL" || shipment.status === selectedStatus
            )
            .map((shipment) => (
              <React.Fragment key={shipment.id}>
                <div
                  onClick={() => toggleRowExpansion(shipment.id)}
                  className={`grid grid-cols-9 pl-6 text-xs text-gray-500 ${
                    getStatusStyles(shipment.status).row
                  } border border-t-0 border-x-0 py-3 pr-6 items-center cursor-pointer`}
                >
                  <div>#{shipment.id}</div>
                  <div className="text-black">{shipment.buyer}</div>
                  <div className="text-black">{shipment.destination}</div>
                  <div>
                    <div className="text-black">
                      {formatDate(shipment.departure)}
                    </div>
                    <div className="text-gray-500">
                      {formatTime(shipment.departure)}
                    </div>
                  </div>
                  <div>
                    <div className="text-black">
                      {shipment.arrival ? formatDate(shipment.arrival) : "-"}
                    </div>
                    <div className="text-gray-500">
                      {shipment.arrival ? formatTime(shipment.arrival) : "-"}
                    </div>
                  </div>
                  <div className="text-black">
                    ₱{" "}
                    {isNaN(Number(shipment.capital))
                      ? "0"
                      : Number(shipment.capital).toLocaleString("en-PH")}
                  </div>
                  <div className="text-black">
                    {formatCurrency(shipment.calculatedRevenue)}
                  </div>
                  <div className="text-black">
                    {shipment.calculatedDiff !== null
                      ? formatCurrency(shipment.calculatedDiff)
                      : "-"}
                  </div>
                  <div className="flex items-center justify-center text-center">
                    <div
                      className={`px-5 rounded-full ${
                        getStatusStyles(shipment.status).badge
                      } font-semibold py-1`}
                    >
                      {shipment.status}
                    </div>
                    <div className="ml-6 text-2xl">
                      {expandedRows.has(shipment.id) ? (
                        <FaSortUp className="mt-3" />
                      ) : (
                        <FaSortDown className="mb-3" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedRows.has(shipment.id) && (
                  <>
                    <div className="grid grid-cols-7 pl-6 text-xs text-gray-500 border border-t-0 border-x-0 py-1 pr-6 items-center">
                      <div>ITEM ID</div>
                      <div>ITEM</div>
                      <div>IN-QUAN.</div>
                      <div>OUT-QUAN.</div>
                      <div>PRICE</div>
                      <div>TOTAL</div>
                      <div>REVENUE</div>
                    </div>
                    {shipment.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-7 pl-6 text-xs border border-t-0 border-x-0 py-4 pr-6 items-center"
                      >
                        <div className="text-gray-400">#{item.id}</div>
                        <div>{item.item}</div>
                        <div>
                          {isNaN(Number(item.in_quan))
                            ? "0"
                            : Number(item.in_quan).toLocaleString("en-PH")}{" "}
                          kgs
                        </div>
                        <div className="text-[#27AE60] font-medium">
                          {isNaN(Number(item.out_quan))
                            ? "0"
                            : Number(item.out_quan).toLocaleString(
                                "en-PH"
                              )}{" "}
                          kgs
                        </div>
                        <div>
                          ₱{" "}
                          {isNaN(Number(item.price))
                            ? "0"
                            : Number(item.price).toLocaleString("en-PH")}
                        </div>
                        <div>
                          ₱{" "}
                          {isNaN(Number(item.total))
                            ? "0"
                            : Number(item.total).toLocaleString("en-PH")}
                        </div>
                        <div>
                          {formatCurrency(
                            parsePrice(item.out_quan) * parsePrice(item.price)
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Shipment;
