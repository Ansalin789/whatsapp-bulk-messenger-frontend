"use client";

import { useEffect } from "react";
import { startRefreshTimer } from "@/lib/token-manager";
import { getAccessExp } from "@/utils/authStorage";

export default function AuthInitializer() {
  useEffect(() => {
     const storedExp =
      getAccessExp();
      const accessExp = storedExp ? Number(storedExp) : null;
    startRefreshTimer(accessExp);
  }, []);

  return null;
}