"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import EditProfileModal from "./EditProfileModal";

interface ProfileDropdownProps {
  userName: string;
  goals: string;
  equipment: string[];
}

export default function ProfileDropdown({ userName, goals, equipment }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditProfile = () => {
    setIsOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      <div className="relative z-50" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">{userName}</span>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 animate-scale-in z-50">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {/* User Info Section */}
              <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 shadow-md shadow-slate-500/30">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500">View Profile</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-600">
                    <span className="font-medium">Goal:</span>{" "}
                    <span className="capitalize">{goals?.replace(/-/g, " ") || "Not set"}</span>
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Equipment:</span>{" "}
                    {equipment && equipment.length > 0 ? equipment.slice(0, 2).join(", ") + (equipment.length > 2 ? "..." : "") : "None"}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={handleEditProfile}
                  className="group/item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-700"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Edit Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="group/item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-all hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentGoal={goals || "general-fitness"}
        currentEquipment={equipment || []}
      />
    </>
  );
}

