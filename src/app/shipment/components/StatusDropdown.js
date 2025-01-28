import React, { useState, useRef } from "react";
import { supabase } from "/utils/supabase/client";

const StatusDropdown = ({ currentStatus, shipmentId, onStatusUpdate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get available status options based on current status
  const getStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "DONE":
        return ["ONGOING", "CANCELLED"];
      case "ONGOING":
        return ["DONE", "CANCELLED"];
      case "CANCELLED":
        return ["DONE", "ONGOING"];
      default:
        return [];
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from("shipmentLogs")
        .update({ status: newStatus })
        .eq("id", shipmentId);

      if (error) throw error;

      // Call the parent's update function to refresh the UI
      onStatusUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      // You might want to add some error notification here
    } finally {
      setIsUpdating(false);
      setShowDropdown(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "DONE":
        return "bg-[#D9FFE9] text-[#27AE60] hover:bg-[#c5ebd5]";
      case "ONGOING":
        return "bg-yellow-100 text-yellow-600 hover:bg-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-600 hover:bg-red-200";
      default:
        return "";
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      // Check if the mouse is over the dropdown before hiding
      if (!dropdownRef.current?.matches(":hover")) {
        setShowDropdown(false);
      }
    }, 300); // 300ms delay before hiding
  };

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      <div
        className={`px-5 rounded-full ${getStatusStyles(currentStatus)} 
          font-semibold py-1 cursor-pointer`}
        onMouseEnter={handleMouseEnter}
      >
        {isUpdating ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          currentStatus
        )}

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            onMouseEnter={handleMouseEnter}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {getStatusOptions(currentStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`block w-full text-left px-4 py-2 text-sm ${getStatusStyles(
                    status
                  )} transition-colors duration-150`}
                  role="menuitem"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDropdown;
