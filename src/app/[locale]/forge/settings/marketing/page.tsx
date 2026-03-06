import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import MarketingSettingsClient from "./MarketingSettingsClient";

export default function MarketingSettingsPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
      <header className="h-[72px] border-b border-white/5 flex items-center px-8 bg-[#050505]">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Integraciones de Marketing
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8 forge-scroll">
        <div className="max-w-4xl mx-auto">
          <MarketingSettingsClient />
        </div>
      </div>
    </div>
  );
}
