import React, { useState } from "react";
import { LuFilter, LuPlus } from "react-icons/lu";
import { TbArrowsSort } from "react-icons/tb";
import { LiaCitySolid } from "react-icons/lia";
import Image from "next/image";
import { ImMakeGroup } from "react-icons/im";
import ProcessItemsModal from "./modals/ProcessItemsModal";

const ProcessedItemsList = ({
  activeButton,
  selectedCity,
  setSelectedCity,
  setIsFilterOpen,
  cities,
  processedItems = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div
        className={`px-6 py-3 justify-between items-center mr-3 ${
          activeButton === "processed" ? "flex" : "hidden"
        }`}
      >
        <div className="py-3 ml-1 font-[500] text-[1.25rem]">
          Processed Items Logs
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center mr-4">
            <div className="text-xl">
              <LiaCitySolid />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setIsFilterOpen(false);
              }}
              className="w-full py-2 pl-1 pr-2 outline-none cursor-pointer rounded-full text-center text-sm font-medium appearance-none"
              style={{
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              <option value="All">All Cities</option>
            </select>
          </div>

          <div className="relative">
            <div
              className="mr-8 flex items-center font-medium cursor-pointer p-2 rounded-xl"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
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
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-[#27AE60] text-white pl-4 pr-3 py-[6px] font-[450] text-sm flex items-center rounded-lg cursor-pointer"
          >
            <div className="mr-2 text-sm">Insert</div>
            <div className="text-xl text-white flex items-center">
              <LuPlus />
            </div>
          </div>
        </div>
      </div>

      <ProcessItemsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Column Headers */}
      <div
        className={`grid grid-cols-5 w-full items-center justify-between pl-8 pr-[2.5rem] 2xl:pr-[3.5rem] bg-gray-50 h-[3rem] text-gray-500 border border-x-0 font-medium ${
          activeButton === "processed" ? "flex" : "hidden"
        }`}
      >
        <div className="text-xs text-center">PROCESS ID</div>
        <div className="col-span-2 text-xs text-center">DATE AND TIME</div>
        <div className="text-xs text-left">ITEM</div>
        <div className="text-xs text-center">QUANTITY</div>
      </div>

      {/* Items List */}
      <div
        className={`max-h-[60vh] overflow-y-auto ${
          activeButton === "processed" ? "block" : "hidden"
        }`}
      >
        {processedItems.map((item) => (
          <div
            key={item.process_id}
            className="grid grid-cols-5 w-full items-center justify-between pl-8 pr-[2.5rem] h-[4rem] border border-x-0 border-t-0 font-[470] hover:shadow-md"
          >
            <div className="text-[0.7rem] text-center">#{item.process_id}</div>
            <div className="col-span-2 text-[0.7rem] text-center">
              <div>
                {new Date(item.processed_at).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div>
                {new Date(item.processed_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </div>
            </div>
            <div className="text-[0.7rem] text-left">
              <div className="flex items-center">
                <div>
                  <Image
                    src={item.image ?? ""}
                    width={27}
                    height={27}
                    alt="item image"
                  />
                </div>
                <div className="ml-2">
                  <div>{item.item}</div>
                  <div className="flex items-center">
                    <ImMakeGroup />
                    <span className="text-[0.65rem] ml-[2px]">{item.type}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[0.7rem] text-center">
              {item.quantity} {item.unit}
              {item.quantity > 1 ? "s" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessedItemsList;
