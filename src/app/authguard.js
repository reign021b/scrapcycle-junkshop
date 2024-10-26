"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "/utils/supabase/client";

const AuthGuard = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      }
    };

    checkAuth();

    // Set up auth state change listener
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

  return children;
};

export default AuthGuard;
