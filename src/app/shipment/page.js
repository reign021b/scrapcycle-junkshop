"use client";

import React from "react";
import Navbar from "../components/navbar";
import { LuFilter, LuPlus } from "react-icons/lu";
import { TbArrowsSort } from "react-icons/tb";
import { FaSortDown, FaSortUp } from "react-icons/fa";

const Shipment = () => {
  return (
    <div>
      <Navbar />
      <div className="w-full bg-gray-50 h-[91vh] mx-auto">
        <div className="max-w-[1340px] mx-auto">
          <p className="text-[1.6rem] font-semibold pt-5 pl-8">
            Sales & Shipment
          </p>
          <p className="text-sm text-gray-400 font-semibold pl-8">
            Purchases / Inventory
          </p>
        </div>
        <div className="max-w-[1340px] h-[78.5vh] mt-6 mx-auto bg-white rounded-2xl border-[1.5px]">
          <div className="px-6 pt-5 pb-2 flex justify-between">
            <div className="text-lg font-bold">Shipment Logs</div>
            <div className="flex text-xs items-center pb-2">
              <div className="mr-14 ml-40 font-[800] text-green-600 cursor-pointer">
                DONE
              </div>
              <div className="mr-14 text-gray-700 cursor-pointer">ONGOING</div>
              <div className="text-gray-700 cursor-pointer">CANCELLED</div>
            </div>
            <div className="flex items-center font-medium ">
              <div className="relative">
                <div className="mr-8 flex items-center font-medium cursor-pointer p-2 rounded-xl">
                  <span className="text-lg">
                    <LuFilter />
                  </span>{" "}
                  <div className="ml-2 text-sm">Filter</div>
                </div>
              </div>
              <div className="mr-8 flex items-center font-medium cursor-pointer">
                <span className="text-lg">
                  <TbArrowsSort />
                </span>{" "}
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
          <div className="grid grid-cols-10 pl-6 text-xs text-gray-500 bg-[#EDFFF4] border border-t-0 border-x-0 py-4 pr-6 items-center">
            <div>#1234FRDDE</div>
            <div className="text-black">Andy Martinez</div>
            <div className="text-black">231 Dar Subdivision, Butuan City</div>
            <div>
              <div className="text-black">2024-12-25</div>
              <div className="text-gray-500">4:26 PM</div>
            </div>
            <div>
              <div className="text-black">2024-12-25</div>
              <div className="text-gray-500">4:26 PM</div>
            </div>
            <div className="text-black">₱ 1,500,000</div>
            <div className="text-black">₱ 1,500,000</div>
            <div className="text-black">₱ 2,104,200</div>
            <div className="text-black">₱ 604,200</div>
            <div className="flex items-center justify-center text-center">
              <div className="px-5 rounded-full bg-[#D9FFE9] text-[#27AE60] font-semibold py-1">
                DONE
              </div>
              <div className="ml-6 text-2xl pt-3">
                <FaSortUp />
              </div>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Shipment;
