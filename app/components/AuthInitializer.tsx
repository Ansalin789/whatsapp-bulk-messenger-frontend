"use client";

import { useEffect } from "react";
import { startRefreshTimer } from "@/lib/token-manager";

export default function AuthInitializer() {
  useEffect(() => {
     const storedExp =
      localStorage.getItem("accessExp");
      const accessExp = storedExp ? Number(storedExp) : null;
    startRefreshTimer(accessExp);
  }, []);

  return null;
}