"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "/utils/supabase/client";

// Icons
import { LiaEqualsSolid } from "react-icons/lia";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import { LuFilter } from "react-icons/lu";
import { LuPlus } from "react-icons/lu";
import { TbArrowsSort, TbEdit } from "react-icons/tb";
import { CgTrash } from "react-icons/cg";
import { ImMakeGroup } from "react-icons/im";
import AddPurchaseModal from "./components/AddPurchaseModal";
import { LiaCitySolid } from "react-icons/lia";

const Inventory = () => {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [purchaseLogs, setPurchaseLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Function to open the Insert Modal
  const openInsertModal = () => {
    setIsInsertModalOpen(true);
  };

  // Handle the closing of the Insert Modal
  const closeInsertModal = () => {
    setIsInsertModalOpen(false);
  };

  const handleSaveEdit = async () => {
    try {
      const total = currentItem.price * currentItem.quantity;

      const { error } = await supabase
        .from("collectedItems")
        .update({
          item: currentItem.item,
          price: currentItem.price,
          quantity: currentItem.quantity,
          total: total,
        })
        .eq("id", currentItem.collected_id);

      if (error) throw error;

      setPurchaseLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.collected_id === currentItem.collected_id
            ? { ...currentItem, total: total } // Ensure the updated total is reflected
            : log
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating item:", error.message);
    }
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleEditClick = (item) => {
    setCurrentItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from("collectedItems")
        .delete()
        .eq("id", currentItem.collected_id);

      if (error) throw error;

      setPurchaseLogs((prevLogs) =>
        prevLogs.filter(
          (item) => item.collected_id !== currentItem.collected_id
        )
      );
    } catch (error) {
      console.error("Error deleting item:", error.message);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const fetchInventory = async (initialFetch = false) => {
    if (initialFetch) setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error("No authenticated session found");
      }

      const { data: operatorData, error: operatorError } = await supabase
        .from("operators")
        .select("id, junkshop_id")
        .eq("id", session.user.id)
        .single();

      if (operatorError) throw operatorError;
      if (!operatorData) throw new Error("Operator not found");

      const { data, error } = await supabase.rpc(
        "get_purchase_logs_for_junkshop_inventory"
      );

      if (error) throw error;

      const filteredData = data.filter(
        (item) => item.junkshop_id === operatorData.junkshop_id
      );

      // Extract unique cities
      const uniqueCities = [
        ...new Set(filteredData.map((item) => item.city)),
      ].filter(Boolean);
      setCities(uniqueCities);
      setPurchaseLogs(filteredData);
      setFilteredLogs(filteredData);
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
      setError(error.message);
    } finally {
      if (initialFetch) setLoading(false);
    }
  };

  useEffect(() => {
    // Trigger loading only once on initial render
    const initialFetch = async () => {
      setLoading(true);
      await fetchInventory();
      setLoading(false);
    };
    initialFetch();
  }, []);

  useEffect(() => {
    // Trigger fetchInventory only when isInsertModalOpen is set to false
    if (!isInsertModalOpen) {
      fetchInventory();
    }
  }, [isInsertModalOpen]);

  useEffect(() => {
    if (selectedCity === "All") {
      setFilteredLogs(purchaseLogs);
    } else {
      const filtered = purchaseLogs.filter((log) => log.city === selectedCity);
      setFilteredLogs(filtered);
    }
  }, [selectedCity, purchaseLogs]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  if (authChecking) {
    return (
      <div className="flex gap-2 w-screen h-screen m-auto justify-center items-center bg-white">
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex gap-2 w-screen h-screen m-auto justify-center items-center bg-white">
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
        <div className="w-5 h-5 rounded-full animate-pulse bg-green-600"></div>
      </div>
    );
  }
  if (error)
    return (
      <div className="flex items-center justify-center h-screen w-screen mx-auto my-auto">
        <div>Error: {error}.</div> &nbsp; <div>Please refresh the page.</div>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="bg-[#F8F8F8] h-auto">
        <div className="mx-12 max-w-[1340px] 2xl:mx-auto pt-3 pl-8">
          <p className="font-semibold text-[1.6rem]">Scrap Inventory</p>
          <p className="text-gray-400 text-sm font-medium">
            Purchases / Inventory
          </p>
        </div>
        <div className="flex justify-between mx-12 mt-6 max-w-[1340px] 2xl:mx-auto">
          <div className="w-[354px] min-h-[58.8rem] bg-white rounded-2xl border-[0.5px]">
            <div>
              <p className="p-6 ml-1 font-[500] text-[1.25rem]">
                All Scrap Items
              </p>
            </div>
            <div className="flex bg-green-50 justify-between">
              <div className="px-6 py-3 flex items-center">
                <LiaEqualsSolid />
                &nbsp; &nbsp;
                <p className="font-medium text-[1rem]">Metals</p>
              </div>
              <div className="text-[1.7rem] text-green-600 flex items-center px-5">
                <BsFillPlusSquareFill />
              </div>
            </div>
            <div className="pl-6 pr-3 py-2 mt-2 flex justify-between">
              <div className="flex">
                <div>
                  <Image
                    src="https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/junkshop-admin/Copper.png"
                    width={50}
                    height={50}
                    alt="Copper"
                  />
                </div>
                <div className="ml-3 items-center">
                  <p className="font-semibold">Copper A</p>
                  <p className="pt-1 font-[480] text-sm text-gray-500">
                    ₱ 12.00 / kg
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <div className="flex items-center text-xs mb-2 justify-end">
                    <p>528 kg / 800 kg</p>
                  </div>
                  <div className="flex items-end">
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl"></div>
                  </div>
                </div>
                <div className="ml-2 text-gray-500 font-extralight">
                  <SlOptionsVertical />
                </div>
              </div>
            </div>

            <div className="pl-6 pr-3 py-2 mt-2 flex justify-between">
              <div className="flex">
                <div>
                  <Image
                    src="https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/junkshop-admin/Copper.png"
                    width={50}
                    height={50}
                    alt="Copper"
                  />
                </div>
                <div className="ml-3 items-center">
                  <p className="font-semibold">Copper A</p>
                  <p className="pt-1 font-[480] text-sm text-gray-500">
                    ₱ 12.00 / kg
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <div className="flex items-center text-xs mb-2 justify-end">
                    <p>528 kg / 800 kg</p>
                  </div>
                  <div className="flex items-end">
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl"></div>
                  </div>
                </div>
                <div className="ml-2 text-gray-500 font-extralight">
                  <SlOptionsVertical />
                </div>
              </div>
            </div>

            <div className="pl-6 pr-3 py-2 mt-2 flex justify-between">
              <div className="flex">
                <div>
                  <Image
                    src="https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/junkshop-admin/Copper.png"
                    width={50}
                    height={50}
                    alt="Copper"
                  />
                </div>
                <div className="ml-3 items-center">
                  <p className="font-semibold">Copper A</p>
                  <p className="pt-1 font-[480] text-sm text-gray-500">
                    ₱ 12.00 / kg
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <div className="flex items-center text-xs mb-2 justify-end">
                    <p>528 kg / 800 kg</p>
                  </div>
                  <div className="flex items-end">
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl"></div>
                  </div>
                </div>
                <div className="ml-2 text-gray-500 font-extralight">
                  <SlOptionsVertical />
                </div>
              </div>
            </div>

            <div className="pl-6 pr-3 py-2 mt-2 flex justify-between">
              <div className="flex">
                <div>
                  <Image
                    src="https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/junkshop-admin/Copper.png"
                    width={50}
                    height={50}
                    alt="Copper"
                  />
                </div>
                <div className="ml-3 items-center">
                  <p className="font-semibold">Copper A</p>
                  <p className="pt-1 font-[480] text-sm text-gray-500">
                    ₱ 12.00 / kg
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <div className="flex items-center text-xs mb-2 justify-end">
                    <p>528 kg / 800 kg</p>
                  </div>
                  <div className="flex items-end">
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl"></div>
                  </div>
                </div>
                <div className="ml-2 text-gray-500 font-extralight">
                  <SlOptionsVertical />
                </div>
              </div>
            </div>

            <div className="pl-6 pr-3 py-2 mt-2 flex justify-between">
              <div className="flex">
                <div>
                  <Image
                    src="https://alfljqjdwlomzepvepun.supabase.co/storage/v1/object/public/junkshop-admin/Copper.png"
                    width={50}
                    height={50}
                    alt="Copper"
                  />
                </div>
                <div className="ml-3 items-center">
                  <p className="font-semibold">Copper A</p>
                  <p className="pt-1 font-[480] text-sm text-gray-500">
                    ₱ 12.00 / kg
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <div className="flex items-center text-xs mb-2 justify-end">
                    <p>528 kg / 800 kg</p>
                  </div>
                  <div className="flex items-end">
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-green-600 rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl mr-1"></div>
                    <div className="h-[16px] w-[5px] bg-[#D9D9D9] rounded-2xl"></div>
                  </div>
                </div>
                <div className="ml-2 text-gray-500 font-extralight">
                  <SlOptionsVertical />
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Logs */}
          <div className="w-[964px] min-h-[58.8rem] bg-white rounded-2xl border-[0.5px]">
            <div className="px-6 py-3 flex justify-between items-center mr-3">
              <div className="py-3 ml-1 font-[500] text-[1.25rem]">
                Purchase Logs
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
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <div
                    className="mr-8 flex items-center font-medium cursor-pointer p-2 rounded-xl"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
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
                <div
                  onClick={openInsertModal}
                  className="bg-[#27AE60] text-white pl-4 pr-3 py-[6px] font-[450] text-sm flex items-center rounded-lg cursor-pointer"
                >
                  <div className="mr-2 text-sm">Insert</div>
                  <div className="text-xl text-white flex items-center">
                    <LuPlus />
                  </div>
                </div>
              </div>
            </div>

            {/* Insert Modal */}
            <AddPurchaseModal
              isOpen={isInsertModalOpen}
              onClose={closeInsertModal}
            />

            <div className="grid grid-cols-12 w-full items-center justify-between pl-8 pr-[2.5rem]  2xl:pr-[3.5rem] bg-gray-50 h-[3rem] text-gray-500 border border-x-0 font-medium">
              <div className="text-xs text-center">PURCHASE ID</div>
              <div className="col-span-2 text-xs text-center">
                DATE AND TIME
              </div>
              <div className="col-span-3 text-xs text-left">ITEM</div>
              <div className="text-xs text-center">UNIT PRICE</div>
              <div className="text-xs text-center">QUANTITY</div>
              <div className="text-xs text-center">TOTAL</div>
              <div className="col-span-1 text-xs text-center">SELLER</div>
              <div className="col-span-2 text-xs text-center">CHANNEL</div>
            </div>
            <div className="max-h-[50.2rem] overflow-y-auto">
              {filteredLogs.map((item) => (
                <div
                  key={item.collected_id}
                  className={`inventory-item grid grid-cols-12 w-full items-center justify-between pl-8 ${
                    filteredLogs.length < 13 ? "pr-[3.5rem]" : "pr-[2.5rem]"
                  } h-[4rem] border border-x-0 border-t-0 font-[470] group hover:shadow-md`}
                >
                  <div className="text-[0.7rem] text-center items-center">
                    #
                    {item.channel === "Drop-off"
                      ? `D-${item.purchase_id}`
                      : item.purchase_id}
                  </div>
                  <div className="col-span-2 text-[0.7rem] text-center">
                    <div>
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div>
                      {new Date(item.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </div>
                  </div>

                  <div className="col-span-3 text-[0.7rem] text-left w-full">
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
                    ₱{item.price} / {item.unit}
                  </div>
                  <div className="text-[0.7rem] text-center">
                    {item.quantity} {item.unit}
                    {item.quantity > 1 ? "s" : ""}
                  </div>
                  <div className="text-[0.7rem] text-center">
                    ₱
                    {item.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-[0.7rem] text-center">
                    {item.seller
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                    <div>{item.contact}</div>
                  </div>
                  <div className="col-span-2 text-[0.7rem] text-center group-hover:hidden">
                    {item.channel}
                  </div>
                  <div className="hidden col-span-2 text-[0.7rem] text-center group-hover:flex mx-auto">
                    <div className="flex text-xl">
                      <CgTrash
                        className="mr-2 cursor-pointer hover:text-red-600"
                        onClick={() => handleDeleteClick(item)}
                      />
                      <TbEdit
                        className="cursor-pointer hover:text-green-600"
                        onClick={() => handleEditClick(item)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Edit Modal */}
              {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                  <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                    <h2 className="text-xl text-center font-bold mb-4">
                      Edit Purchase{" "}
                      {currentItem.channel === "Drop-off"
                        ? `#D-${currentItem.purchase_id}`
                        : `#${currentItem.purchase_id}`}
                    </h2>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Item:
                        <input
                          type="text"
                          value={currentItem.item}
                          onChange={(e) =>
                            setCurrentItem((prev) => ({
                              ...prev,
                              item: e.target.value,
                            }))
                          }
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 cursor-not-allowed bg-gray-50"
                        />
                      </label>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Price:
                        <input
                          type="number"
                          value={currentItem.price}
                          onChange={(e) =>
                            setCurrentItem((prev) => ({
                              ...prev,
                              price: Number(e.target.value),
                            }))
                          }
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 cursor-not-allowed bg-gray-50"
                        />
                      </label>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity:
                        <input
                          type="number"
                          value={currentItem.quantity}
                          step={currentItem.unit === "kg" ? "any" : "1"}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newValue =
                              currentItem.unit === "kg"
                                ? value
                                : Math.floor(value);
                            setCurrentItem((prev) => ({
                              ...prev,
                              quantity: Number(newValue),
                            }));
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                      </label>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Total:
                        <input
                          type="text"
                          value={Number(
                            currentItem.price * currentItem.quantity
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "PHP",
                          })}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 cursor-not-allowed bg-gray-50"
                        />
                      </label>
                    </div>
                    <div className="flex justify-end text-sm">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-[#27AE60] text-white py-2 px-4 rounded-lg mr-2 hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-lg">
                    <h2 className="text-xl mb-4">Are you sure?</h2>
                    <p>Do you really want to delete this item?</p>
                    <div className="mt-4 flex justify-end">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded mr-2"
                        onClick={handleDeleteConfirm}
                      >
                        Delete
                      </button>
                      <button
                        className="bg-gray-200 px-4 py-2 rounded"
                        onClick={() => setIsDeleteModalOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
