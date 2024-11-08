"use client";

import Image from "next/image";
import { supabase } from "/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

// Icons
import { AiOutlineHome } from "react-icons/ai";
import { TiLocationArrowOutline } from "react-icons/ti";
import { MdOutlineInventory, MdOutlineBarChart } from "react-icons/md";
import { BsTruck } from "react-icons/bs";
import { FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between px-10 py-3">
      <div className="relative inline-block w-[14.6rem]">
        <Image
          src="/scrapcycle-logo.png"
          width={207}
          height={55}
          alt="Logo"
          className="block"
        />
        <span className="absolute mt-6 ml-5 inset-1 flex items-center justify-center text-[0.7rem] text-gray-600">
          Scrapyard Management System
        </span>
      </div>

      <div className="flex justify-between">
        <Link href="#">
          <div className="flex items-center mr-2 hover:bg-green-50 hover:text-green-600 p-3 rounded-lg cursor-pointer">
            <AiOutlineHome className="text-2xl" />
            <p className="font-semibold text-sm ml-2">Dashboard</p>
          </div>
        </Link>

        <Link href="#">
          <div className="flex items-center mr-2 hover:bg-green-50 hover:text-green-600 p-3 rounded-lg group">
            <TiLocationArrowOutline className="text-2xl border-2 rounded-full border-black font-bold group-hover:border-green-600" />
            <p className="font-semibold text-sm ml-2">Tracking</p>
          </div>
        </Link>

        <Link href="/inventory">
          <div className="flex items-center mr-2 hover:bg-green-50 hover:text-green-600 p-3 rounded-lg group">
            <MdOutlineInventory className="text-2xl" />
            <p className="font-semibold text-sm ml-2">Inventory</p>
          </div>
        </Link>

        <Link href="#">
          <div className="flex items-center mr-2 hover:bg-green-50 hover:text-green-600 p-3 rounded-lg group">
            <BsTruck className="text-2xl transform scale-x-[-1]" />
            <p className="font-semibold text-sm ml-2">Shipment</p>
          </div>
        </Link>

        <Link href="#">
          <div className="flex items-center mr-2 hover:bg-green-50 hover:text-green-600 p-3 rounded-lg group">
            <MdOutlineBarChart className="text-xl border-2 rounded border-black font-bold group-hover:border-green-600" />
            <p className="font-semibold text-sm ml-2">Finances</p>
          </div>
        </Link>
      </div>
      <div className="flex items-center">
        <Image
          src="/reignme.jpg"
          width={40}
          height={40}
          alt="Profile"
          className="rounded-full"
        />
        <p className="ml-2 font-semibold">Reignme Burdeos</p>
        <div
          className="border-2 border-gray-900 rounded-lg p-[0.4rem] ml-2 cursor-pointer text-gray-900 hover:border-red-600 hover:text-red-600"
          onClick={() => setShowLogoutModal(true)}
        >
          <FaSignOutAlt />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center w-80">
            <p className="text-lg font-semibold mb-4">Confirm Logout</p>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                onClick={handleSignOut}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
