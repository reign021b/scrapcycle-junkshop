"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { supabase } from "/utils/supabase/client";
import NewShipmentModal from "./modals/NewShipmentModal";
import StatusDropdown from "./components/StatusDropdown";
import Image from "next/image";

// Icons
import { LuFilter, LuSearch, LuX } from "react-icons/lu";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import { ImMakeGroup } from "react-icons/im";

const Shipment = () => {
  const [selectedStatus, setSelectedStatus] = useState("ONGOING");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const filteredShipments = shipments.filter(
    (shipment) =>
      (selectedStatus === "ALL" || shipment.status === selectedStatus) &&
      (searchTerm === "" ||
        shipment.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Toggle search input visibility
  const toggleSearchVisibility = () => {
    setIsSearchVisible(!isSearchVisible);
    setSearchTerm("");
  };

  const handleShipmentCreated = () => {
    fetchShipments();
  };

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
      // Fetch all needed data at once
      const [
        shipmentLogsResult,
        itemsResult,
        itemgoalsResult,
        itemtypesResult,
      ] = await Promise.all([
        supabase
          .from("shipmentLogs")
          .select("*")
          .order("shipping_date", { ascending: false }),
        supabase.from("shippedItems").select("*"),
        supabase.from("itemgoals").select("*"),
        supabase.from("itemtypes").select("*"),
      ]);

      // Check for errors
      if (shipmentLogsResult.error) throw shipmentLogsResult.error;
      if (itemsResult.error) throw itemsResult.error;
      if (itemgoalsResult.error) throw itemgoalsResult.error;
      if (itemtypesResult.error) throw itemtypesResult.error;

      // Create lookup objects for faster access
      const itemgoalsMap = itemgoalsResult.data.reduce((acc, item) => {
        acc[item.item] = {
          image: item.image,
          type: item.type,
          unit: item.unit,
        };
        return acc;
      }, {});

      const itemtypesMap = itemtypesResult.data.reduce((acc, type) => {
        acc[type.id] = type.name;
        return acc;
      }, {});

      // Process shipments with their items
      const shipmentsWithItems = shipmentLogsResult.data.map((shipment) => {
        const shipmentItems = itemsResult.data
          .filter((item) => item.shipment_id === shipment.id)
          .map((item) => {
            const itemgoalInfo = itemgoalsMap[item.item] || {};
            return {
              ...item,
              image: itemgoalInfo.image || "",
              type: itemtypesMap[itemgoalInfo.type] || "",
              unit: itemgoalInfo.unit || "-",
            };
          });

        const totals = calculateShipmentTotals(shipmentItems);

        return {
          ...shipment,
          items: shipmentItems,
          calculatedCapital: totals.capital,
          calculatedTotal: totals.total,
          calculatedRevenue: totals.revenue,
          calculatedDiff:
            totals.revenue > 0 ? totals.revenue - totals.capital : null,
        };
      });

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
              <div className="flex items-center relative">
                <div
                  onClick={toggleSearchVisibility}
                  className="mr-4 flex items-center font-medium cursor-pointer p-2 rounded-xl"
                >
                  <span className="text-lg">
                    <LuFilter />
                  </span>
                  <div className="ml-2 text-sm">Filter</div>
                </div>

                <div
                  className={`font-normal flex items-center transition-all duration-300 ease-in-out mr-2 ${
                    isSearchVisible ? "w-72" : "w-0 overflow-hidden"
                  }`}
                >
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search buyer or destination"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="font-regular w-full pl-8 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <LuSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600" />
                    {searchTerm && (
                      <LuX
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-600"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="mr-6 border-[0.5px] border-r-0 h-10"></div>
              <NewShipmentModal onShipmentCreated={handleShipmentCreated} />
            </div>
          </div>

          {/* Column Title */}
          <div
            className={`grid ${
              selectedStatus === "DONE" ? "grid-cols-9" : "grid-cols-6"
            } pl-6 text-xs text-gray-500 bg-[#FCFCFC] border border-x-0 py-4 pr-6`}
          >
            <div>SHIPMENT ID</div>
            <div>BUYER</div>
            <div>DESTINATION</div>
            <div>DEPARTURE</div>
            {selectedStatus === "DONE" && (
              <>
                <div>ARRIVAL</div>
              </>
            )}
            <div>CAPITAL</div>
            {selectedStatus === "DONE" && (
              <>
                <div>REVENUE</div>
                <div>DIFF</div>
              </>
            )}
            <div className="justify-center items-center flex">
              <div>STATUS</div>
              <div className="ml-12"></div>
            </div>
          </div>
          <div className="overflow-y-auto h-[65vh]">
            {/* Rows of Data */}
            {filteredShipments.map((shipment) => (
              <React.Fragment key={shipment.id}>
                <div
                  onClick={() => toggleRowExpansion(shipment.id)}
                  className={`grid ${
                    shipment.status === "DONE" ? "grid-cols-9" : "grid-cols-6"
                  } pl-6 text-xs text-gray-500 ${
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
                  {shipment.status === "DONE" && (
                    <>
                      <div>
                        <div className="text-black">
                          {formatDate(shipment.arrival)}
                        </div>
                        <div className="text-gray-500">
                          {formatTime(shipment.arrival)}
                        </div>
                      </div>
                      <div className="text-black">
                        {formatCurrency(shipment.calculatedCapital)}
                      </div>
                      <div className="text-black">
                        {formatCurrency(shipment.calculatedRevenue)}
                      </div>
                      <div className="text-black">
                        {shipment.calculatedDiff !== null
                          ? formatCurrency(shipment.calculatedDiff)
                          : "-"}
                      </div>
                    </>
                  )}
                  {shipment.status !== "DONE" && (
                    <>
                      <div className="text-black">
                        {formatCurrency(shipment.calculatedTotal)}
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-center text-center">
                    <StatusDropdown
                      currentStatus={shipment.status}
                      shipmentId={shipment.id}
                      onStatusUpdate={fetchShipments}
                    />
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
                    <div
                      className={`grid ${
                        shipment.status === "DONE"
                          ? "grid-cols-7"
                          : "grid-cols-5"
                      } pl-6 text-xs text-gray-500 border border-t-0 border-x-0 py-1 pr-6 items-center`}
                    >
                      <div>ITEM ID</div>
                      <div>ITEM</div>
                      <div>IN-QUAN.</div>
                      <div>PRICE</div>
                      <div>TOTAL</div>
                      {shipment.status === "DONE" && (
                        <>
                          <div>OUT-QUAN.</div>
                          <div>REVENUE</div>
                        </>
                      )}
                    </div>
                    {shipment.items.map((item) => (
                      <div
                        key={item.id}
                        className={`grid ${
                          shipment.status === "DONE"
                            ? "grid-cols-7"
                            : "grid-cols-5"
                        } pl-6 text-xs border border-t-0 border-x-0 py-4 pr-6 items-center`}
                      >
                        <div className="text-gray-400">#{item.id}</div>
                        <div className="flex items-center">
                          <div>
                            <Image
                              src={item.image || ""}
                              width={27}
                              height={27}
                              alt="item image"
                            />
                          </div>
                          <div className="ml-2">
                            <div>
                              {item.item.replace(/\b\w/g, (char) =>
                                char.toUpperCase()
                              )}
                            </div>
                            <div className="flex w-full items-center">
                              <div>
                                <ImMakeGroup />
                              </div>
                              <div className="text-[0.65rem] ml-[2px]">
                                {item.type}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          {isNaN(Number(item.in_quan))
                            ? "0"
                            : Number(item.in_quan).toLocaleString("en-PH")}{" "}
                          {item.unit}
                        </div>

                        <div>{formatCurrency(parsePrice(item.price))}</div>
                        <div>{formatCurrency(parsePrice(item.total))}</div>
                        {shipment.status === "DONE" && (
                          <>
                            <div className="text-[#27AE60] font-medium">
                              {isNaN(Number(item.out_quan))
                                ? "0"
                                : Number(item.out_quan).toLocaleString(
                                    "en-PH"
                                  )}{" "}
                              {item.unit}
                            </div>
                            <div>
                              {item.out_quan && item.price
                                ? formatCurrency(
                                    parsePrice(item.out_quan) *
                                      parsePrice(item.price)
                                  )
                                : "-"}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipment;
