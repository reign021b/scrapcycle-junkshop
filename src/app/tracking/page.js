"use client";

import React from "react";
import Navbar from "../components/navbar";

//Icons
import { TbTruck } from "react-icons/tb";
import { FaSortDown } from "react-icons/fa";
import { FaSortUp } from "react-icons/fa";
import { PiRecordFill } from "react-icons/pi";
import { FaPhoneAlt } from "react-icons/fa";
import Image from "next/image";

const Tracking = () => {
  return (
    <div>
      <Navbar />
      <div className="bg-[#F8F8F8] h-[91vh]">
        <div className="mx-12 max-w-[1340px] 2xl:mx-auto pt-5 pb-6 pl-8">
          <p className="font-semibold text-[1.6rem]">Live Shipment Tracking</p>
          <p className=" text-[#828282] text-sm font-[500]">
            Track your shipment&apos;s location in real-time!
          </p>
        </div>
        <div className="flex justify-between mx-12 max-w-[1340px] 2xl:mx-auto">
          {/* 1st column */}
          <div className="bg-white w-[354px] h-[79vh] rounded-2xl border-[1.5px] border-gray-200 pt-2">
            {/* Shipped widget */}
            <div className="flex justify-center mx-5 mt-[1.2rem]  border-[1.5px] border-gray-200 rounded-xl">
              <div className="flex items-center w-full py-[0.7rem]">
                <div className="flex items-center mx-5 text-2xl text-green-600">
                  <div className=" border-[1.5px] rounded-full p-1 border-gray-200">
                    <TbTruck />
                  </div>
                </div>
                <div className="">
                  <div className="text-xs">Shipment ID</div>
                  <div className="text-gray-500 font-medium">#1234FRDDE</div>
                </div>
                <div className="flex font-bold text-[0.65rem] items-center ml-5 rounded-xl bg-[#D7FBE8]">
                  <div className="px-5 py-1 text-[#219653]">Shipped</div>
                </div>
                <div className="flex items-center text-xl mb-2 ml-3 text-gray-500">
                  <FaSortDown />
                </div>
              </div>
            </div>

            {/* Shipped widget */}
            <div className="flex justify-center mx-5 mt-[1.2rem]  border-[1.5px] border-gray-200 rounded-xl rounded-b-none">
              <div className="flex items-center w-full py-[0.7rem]">
                <div className="flex items-center mx-5 text-2xl text-green-600">
                  <div className=" border-[1.5px] rounded-full p-1 border-gray-200">
                    <TbTruck />
                  </div>
                </div>
                <div className="">
                  <div className="text-xs">Shipment ID</div>
                  <div className="text-gray-500 font-medium">#RTHDY333</div>
                </div>
                <div className="flex font-bold text-[0.65rem] items-center ml-5 rounded-xl bg-[#D7F5FB]">
                  <div className="px-5 py-1 text-[#0099FF]">In transit</div>
                </div>
                <div className="flex items-center text-xl mt-2 ml-3 text-gray-500">
                  <FaSortUp />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mx-5 border-[1.5px] border-t-0 border-gray-200 ">
              <div className="relative p-5">
                <div className="flex">
                  <div className="flex flex-col items-center">
                    <div className="text-[#27AE60] text-lg">
                      <PiRecordFill />
                    </div>
                    <div className="mt-1 h-14 w-[2px] bg-[#27AE60]"></div>{" "}
                  </div>
                  <div className="ml-2 text-xs text-gray-500">
                    <div className="pb-1">11 March, Monday</div>
                    <div className="font-bold text-black">
                      RC Junkshop, Ong Yiu, Butuan City
                    </div>
                    <div>12:00 PM</div>
                  </div>
                </div>

                <div className="flex mt-1">
                  <div className="flex flex-col items-center">
                    <div className="text-[#27AE60] text-lg">
                      <PiRecordFill />
                    </div>
                    <div className="mt-1 h-14 w-[2px] bg-[#27AE60]"></div>{" "}
                  </div>
                  <div className="ml-2 text-xs text-gray-500">
                    <div className="pb-1">11 March, Monday</div>
                    <div className="font-bold text-black">JC Aquino Avenue</div>
                    <div>12:30 PM - 12:33 PM</div>
                  </div>
                </div>

                <div className="flex mt-1">
                  <div className="flex flex-col items-center">
                    <div className="text-[#27AE60] text-lg">
                      <PiRecordFill />
                    </div>
                    <div className="mt-1 h-14 w-[2px] bg-gray-300"></div>{" "}
                  </div>
                  <div className="ml-2 text-xs text-gray-500">
                    <div className="pb-1">11 March, Monday</div>
                    <div className="font-bold text-black">Bayugan City</div>
                    <div>12:30 PM - 12:33 PM</div>
                  </div>
                </div>

                <div className="flex mt-1">
                  <div className="flex flex-col items-center">
                    <div className="text-gray-300 text-lg">
                      <PiRecordFill />
                    </div>
                  </div>
                  <div className="ml-2 text-xs text-gray-500">
                    <div className="pb-1">11 March, Monday</div>
                    <div className="font-bold text-black">Barobo Station</div>
                    <div>Not arrived yet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier Details */}
            <div className="mx-5 border-[1.5px] border-t-0 border-gray-200 p-5 rounded-xl rounded-t-none">
              <div className="flex justify-between">
                <div className="flex">
                  <div className="rounded-full h-[36px]">
                    <Image
                      alt="carrier profile"
                      width={36}
                      height={36}
                      src={
                        "https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/avatars/Ellipse%205.png"
                      }
                    />
                  </div>
                  <div className="text-xs ml-3">
                    <div>Carrier</div>
                    <div className="font-bold">Reymark Galora</div>
                  </div>
                </div>

                <div className="flex items-center text-[#27AE60]">
                  <div className="bg-[#D7FBE8] rounded-full p-2">
                    <FaPhoneAlt />
                  </div>
                </div>
              </div>
            </div>

            {/* Ongoing widget */}
            <div className="flex justify-center mx-5 mt-[1.2rem]  border-[1.5px] border-gray-200 rounded-xl">
              <div className="flex items-center w-full py-[0.7rem]">
                <div className="flex items-center mx-5 text-2xl text-green-600">
                  <div className=" border-[1.5px] rounded-full p-1 border-gray-200">
                    <TbTruck />
                  </div>
                </div>
                <div className="">
                  <div className="text-xs">Shipment ID</div>
                  <div className="text-gray-500 font-medium">#54JSDIGCD</div>
                </div>
                <div className="flex font-bold text-[0.65rem] items-center ml-5 rounded-xl bg-[#FFF3CD]">
                  <div className="px-5 py-1 text-[#F2994A]">Ongoing</div>
                </div>
                <div className="flex items-center text-xl mb-2 ml-3 text-gray-500">
                  <FaSortDown />
                </div>
              </div>
            </div>
          </div>

          {/* 2nd column */}
          <div className="bg-white w-[965px] h-[79vh] rounded-xl  border-[1.5px] border-gray-200">
            <div className="flex justify-center items-center h-full">Map</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
