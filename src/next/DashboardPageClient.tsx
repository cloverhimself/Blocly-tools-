"use client";

import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("../tool-pages/Dashboard").then((m) => ({ default: m.Dashboard })));

function PageFallback() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-6 h-6 border-2 border-[#111111]/20 border-t-[#FFD400] rounded-full animate-spin" />
    </div>
  );
}

export function DashboardPageClient() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Dashboard />
    </Suspense>
  );
}
