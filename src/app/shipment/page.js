"use client";

import React, { useState } from "react";
import Navbar from "../components/navbar";
import { LuFilter, LuPlus } from "react-icons/lu";
import { TbArrowsSort } from "react-icons/tb";
import { FaSortDown, FaSortUp } from "react-icons/fa";

const Shipment = () => {
  const [selectedStatus, setSelectedStatus] = useState("DONE");
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Sample data - you would replace this with your actual data
  const shipments = [
    {
      id: "#1234FRDDE",
      buyer: "Andy Martinez",
      destination: "231 Dar Subdivision, Butuan City",
      departure: { date: "2024-12-25", time: "4:26 PM" },
      arrival: { date: "2024-12-25", time: "4:26 PM" },
      cost: "₱ 1,500,000",
      capital: "₱ 1,500,000",
      total: "₱ 2,104,200",
      profit: "₱ 604,200",
      status: "DONE",
      items: [
        {
          itemId: "#1234FRDDE",
          item: "Copper",
          capital: "₱ 1,500,000",
          inQuan: "5,000 kgs",
          outQuan: "5,010 kgs",
          price: "₱ 420.00 / kg",
          total: "₱ 2,104,200",
          profit: "₱ 604,200",
        },
      ],
    },
    {
      id: "#1234FESAE",
      buyer: "Reignme Burdeos",
      destination: "Emenvil Subdivision, Butuan City",
      departure: { date: "2024-11-12", time: "4:26 PM" },
      arrival: { date: "2024-11-12", time: "4:26 PM" },
      cost: "₱ 2,600,000",
      capital: "₱ 2,600,000",
      total: "₱ 3,204,200",
      profit: "₱ 704,200",
      status: "ONGOING",
      items: [
        {
          itemId: "#1234FRDDE",
          item: "Copper",
          capital: "₱ 1,500,000",
          inQuan: "5,000 kgs",
          outQuan: "5,010 kgs",
          price: "₱ 420.00 / kg",
          total: "₱ 2,104,200",
          profit: "₱ 604,200",
        },
      ],
    },
    {
      id: "#1234RREEE",
      buyer: "Elro Estoque",
      destination: "Alviola Village, Butuan City",
      departure: { date: "2024-10-25", time: "4:26 PM" },
      arrival: { date: "2024-10-25", time: "4:26 PM" },
      cost: "₱ 1,500,000",
      capital: "₱ 1,500,000",
      total: "₱ 2,104,200",
      profit: "₱ 604,200",
      status: "CANCELLED",
      items: [
        {
          itemId: "#1234FRDDE",
          item: "Copper",
          capital: "₱ 1,500,000",
          inQuan: "5,000 kgs",
          outQuan: "5,010 kgs",
          price: "₱ 420.00 / kg",
          total: "₱ 2,104,200",
          profit: "₱ 604,200",
        },
      ],
    },
  ];

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
                      ? "text-green-600 font-[800]"
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
          <div className="grid grid-cols-10 pl-6 text-xs text-gray-500 bg-[#FCFCFC] border border-x-0 py-4 pr-6">
            <div>SHIPMENT ID</div>
            <div>BUYER</div>
            <div>DESTINATION</div>
            <div>DEPARTURE</div>
            <div>ARRIVAL</div>
            <div>COST</div>
            <div>CAPITAL</div>
            <div>TOTAL</div>
            <div>PROFIT</div>
            <div className="justify-center items-center flex">
              <div>STATUS</div>
              <div className="ml-12 "></div>
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
                  className={`grid grid-cols-10 pl-6 text-xs text-gray-500 ${
                    getStatusStyles(shipment.status).row
                  } border border-t-0 border-x-0 py-3 pr-6 items-center cursor-pointer`}
                >
                  <div>{shipment.id}</div>
                  <div className="text-black">{shipment.buyer}</div>
                  <div className="text-black">{shipment.destination}</div>
                  <div>
                    <div className="text-black">{shipment.departure.date}</div>
                    <div className="text-gray-500">
                      {shipment.departure.time}
                    </div>
                  </div>
                  <div>
                    <div className="text-black">{shipment.arrival.date}</div>
                    <div className="text-gray-500">{shipment.arrival.time}</div>
                  </div>
                  <div className="text-black">{shipment.cost}</div>
                  <div className="text-black">{shipment.capital}</div>
                  <div className="text-black">{shipment.total}</div>
                  <div className="text-black">{shipment.profit}</div>
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
                    <div className="grid grid-cols-8 pl-6 text-xs text-gray-500 border border-t-0 border-x-0 py-1 pr-6 items-center">
                      <div>ITEM ID</div>
                      <div>ITEM</div>
                      <div>CAPITAL</div>
                      <div>IN-QUAN.</div>
                      <div>OUT-QUAN.</div>
                      <div>PRICE</div>
                      <div>TOTAL</div>
                      <div className="text-center px-5">
                        <div className="pr-4">PROFIT</div>
                      </div>
                    </div>
                    {shipment.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-8 pl-6 text-xs border border-t-0 border-x-0 py-4 pr-6 items-center"
                      >
                        <div className="text-gray-400">{item.itemId}</div>
                        <div>{item.item}</div>
                        <div>{item.capital}</div>
                        <div>{item.inQuan}</div>
                        <div className="text-[#27AE60] font-medium">
                          {item.outQuan}
                        </div>
                        <div>{item.price}</div>
                        <div>{item.total}</div>
                        <div className="text-center px-5">
                          <div className="pr-4 text-[#27AE60] font-medium">
                            {item.profit}
                          </div>
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
