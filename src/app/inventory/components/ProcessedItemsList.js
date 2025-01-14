import React, { useState, useEffect } from "react";
import { supabase } from "/utils/supabase/client";
import { LuFilter, LuPlus } from "react-icons/lu";
import { TbArrowsSort } from "react-icons/tb";
import { LiaCitySolid } from "react-icons/lia";
import { ImMakeGroup } from "react-icons/im";
import Image from "next/image";
import ProcessItemsModal from "./modals/ProcessItemsModal";

const ProcessedItemsList = ({ activeButton }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [junkshopId, setJunkshopId] = useState(null);

  const fetchProcessedItems = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("No authenticated user");

      const { data: operatorData, error: operatorError } = await supabase
        .from("operators")
        .select("junkshop_id")
        .eq("id", user.id)
        .single();

      if (operatorError) throw operatorError;

      setJunkshopId(operatorData.junkshop_id);

      const { data, error } = await supabase
        .rpc("get_processed_items")
        .eq("junkshop_id", operatorData.junkshop_id);

      if (error) throw error;

      setProcessedItems(data || []);
    } catch (error) {
      console.error("Error fetching processed items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProcessedItems();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!junkshopId) return;

    // Subscribe to the processed_items table
    const subscription = supabase
      .channel("processed_items_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "processed_items",
          filter: `junkshop_id=eq.${junkshopId}`,
        },
        () => {
          // Refetch the data when any change occurs
          fetchProcessedItems();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [junkshopId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

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
        className={`grid grid-cols-4 w-full items-center justify-between pl-8 pr-[2.5rem] 2xl:pr-[3.5rem] bg-gray-50 h-[3rem] text-gray-500 border border-x-0 font-medium ${
          activeButton === "processed" ? "flex" : "hidden"
        }`}
      >
        <div className="text-xs text-center">PROCESS ID</div>
        <div className="text-xs text-center">DATE AND TIME</div>
        <div className="text-xs text-left">ITEM</div>
        <div className="text-xs text-center">QUANTITY</div>
      </div>

      {/* Items List */}
      <div
        className={`max-h-[60vh] overflow-y-auto ${
          activeButton === "processed" ? "block" : "hidden"
        }`}
      >
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            {" "}
            {/* Added scrollable container */}
            {processedItems.map((item, index) => {
              const formattedDate = formatDate(item.date_added);
              const prClass =
                processedItems.length > 10 ? "pr-[2.5rem]" : "pr-[3.5rem]";
              return (
                <div
                  key={item.process_id}
                  className={`grid grid-cols-4 w-full items-center justify-between pl-8 ${prClass} h-[3.5rem] border border-x-0 border-t-0 font-[470] hover:shadow-md`}
                >
                  <div className="text-[0.7rem] text-center">
                    #{item.process_id}
                  </div>
                  <div className="text-[0.7rem] text-center">
                    <div>{formattedDate.date}</div>
                    <div>{formattedDate.time}</div>
                  </div>
                  <div className="col-span-1 text-[0.7rem] text-left w-full">
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
                  </div>
                  <div className="text-[0.7rem] text-center">
                    {item.quantity} kg
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessedItemsList;
