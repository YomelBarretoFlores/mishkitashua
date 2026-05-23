"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/app/lib/analytics";

export default function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname;
      trackEvent("page_view", { page: pathname });
    }
  }, [pathname]);

  return null;
}
