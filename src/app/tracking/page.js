"use client";

import React from "react";
import Navbar from "../components/navbar";

const Tracking = () => {
  return (
    <div>
      <Navbar />
      <div className="bg-[#F8F8F8] h-[91vh]">
        <div className="mx-12 max-w-[1340px] 2xl:mx-auto pt-3 pb-6 pl-8">
          <p className="font-semibold text-[1.6rem]">Live Shipment Tracking</p>
          <p className="text-gray-400 text-sm font-[500]">
            Track your shipment&apos;s location in real-time!
          </p>
        </div>
        <div className="flex justify-between mx-12 max-w-[1340px] 2xl:mx-auto">
          <div className="bg-white w-[354px] h-[79vh] rounded-2xl border">
            <div className="flex justify-center items-center h-full">
              Shipment
            </div>
          </div>
          <div className="bg-white w-[965px] h-[79vh] rounded-2xl border">
            <div className="flex justify-center items-center h-full">Map</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
