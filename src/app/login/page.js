"use client";

import { useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkOperatorAccess = async (userId) => {
    const { data, error } = await supabase
      .from("operators")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking operator access:", error);
      return false;
    }

    return !!data; // Returns true if operator exists, false otherwise
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.user) {
        // Check if user exists in operators table
        const hasOperatorAccess = await checkOperatorAccess(data.user.id);

        if (hasOperatorAccess) {
          toast.success("Login successful!");
          router.push("/inventory");
        } else {
          // User exists in auth but not in operators table
          await supabase.auth.signOut(); // Sign them out
          toast.error("Access denied. You are not authorized as an operator.");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col w-96 items-center bg-white px-6 py-8 rounded-xl shadow-lg">
        <Image src={"/logo.png"} width={60} height={60} alt="Logo" priority />
        <p className="text-green-600 font-semibold text-xl my-3">
          ScrapCycle PH Junkshop Admin
        </p>
        <form
          className="flex flex-col w-full items-stretch mt-4 text-gray-800"
          onSubmit={handleLogin}
        >
          <label htmlFor="email" className="text-gray-600 font-medium mb-2">
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-lg border border-gray-400 mb-4 p-3"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="text-gray-600 font-medium mb-2">
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-lg border border-gray-400 mb-4 p-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg p-2 my-3 hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Submit"}
          </button>
        </form>
        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}
