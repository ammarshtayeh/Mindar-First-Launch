"use client";

import { useEffect } from "react";
import { clarity } from "react-microsoft-clarity";
import { MICROSOFT_CLARITY_ID } from "@/lib/analytics";

export const MicrosoftClarity = () => {
  useEffect(() => {
    if (MICROSOFT_CLARITY_ID) {
      clarity.init(MICROSOFT_CLARITY_ID);
    }
  }, []);

  return null;
};
