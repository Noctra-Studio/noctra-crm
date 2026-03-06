"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

// Format price with proper currency formatting (comma separators, no decimals)
const formatPrice = (
  price: number | string,
  currency: "USD" | "MXN"
): string => {
  // Handle "Custom" or string prices
  if (typeof price === "string") {
    return price;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0, // Remove .00 cents for cleanliness
  }).format(price);
};

export function EngagementModels() {
  const t = useTranslations("EngagementModels");
  const [currency, setCurrency] = useState<"MXN" | "USD">("MXN");

  const tiers = [
    {
      id: "foundation",
      popular: false,
    },
    {
      id: "architecture",
      popular: true,
    },
    {
      id: "intelligence",
      popular: false,
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 md:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          {t("label")}
        </p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
          {t("title_line1")}
          <br />
          <span className="text-neutral-600">{t("title_line2")}</span>
        </h2>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>

        {/* Currency Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className="text-xs text-neutral-500 font-mono uppercase">
            {t("currency_toggle")}:
          </span>
          <div className="inline-flex items-center bg-neutral-900/50 border border-neutral-800 rounded-full p-1">
            <button
              onClick={() => setCurrency("MXN")}
              className={`px-4 py-1.5 text-xs font-mono rounded-full transition-all duration-300 ${
                currency === "MXN"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}>
              MXN
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 text-xs font-mono rounded-full transition-all duration-300 ${
                currency === "USD"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}>
              USD
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier, index) => {
          const tierKey = `tiers.${tier.id}`;
          const rawFeatures = t.raw(`${tierKey}.features`);
          const features = Array.isArray(rawFeatures)
            ? (rawFeatures as string[])
            : [];
          const priceMXN = t.raw(`${tierKey}.price_mxn`) as number | string;
          const priceUSD = t.raw(`${tierKey}.price_usd`) as number | string;

          // Get the price prefix - try currency-specific first, fall back to default
          const hasSpecificPrefixes = tier.id === "intelligence";
          let displayPrefix = "";

          if (hasSpecificPrefixes) {
            displayPrefix =
              currency === "MXN"
                ? (t.raw(`${tierKey}.price_prefix_mxn`) as string)
                : (t.raw(`${tierKey}.price_prefix_usd`) as string);
          } else {
            displayPrefix = t(`${tierKey}.price_prefix`) as string;
          }

          // Format the price based on selected currency
          const displayPrice =
            currency === "MXN"
              ? formatPrice(priceMXN, "MXN")
              : formatPrice(priceUSD, "USD");

          // Check if price is "Custom" by checking if raw values are strings (not numbers)
          const isCustom =
            typeof priceMXN === "string" && typeof priceUSD === "string";

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-2xl border bg-zinc-900/50 transition-all duration-300 ${
                tier.popular
                  ? "border-white/20 ring-1 ring-white/20 shadow-[0_0_30px_-10px_rgba(255,255,255,0.15)]"
                  : "border-white/5 hover:border-white/10"
              }`}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                  {t(`${tierKey}.popular_badge`)}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-2">
                  {t(`${tierKey}.name`)}
                </h3>
                <div className="space-y-1">
                  {displayPrefix && (
                    <p className="text-xs text-neutral-500 font-mono">
                      {displayPrefix}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-white">
                      {displayPrice}
                    </span>
                    {!isCustom && (
                      <span className="text-sm font-mono text-neutral-500 uppercase">
                        {currency}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-neutral-400 text-sm mt-2">
                  {t(`${tierKey}.description`)}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-neutral-300">
                    <span className="text-neutral-600">—</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  tier.popular
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                }`}>
                {t("cta")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 max-w-3xl mx-auto">
        <div className="p-6 rounded-xl border border-white/5 bg-neutral-900/50 text-left relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <h4 className="text-lg font-bold text-white tracking-tight">
              {t("recurring_revenue.headline")}
            </h4>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-neutral-300 border border-white/5 whitespace-nowrap">
              {t("recurring_revenue.badge")}
            </span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {t.rich("recurring_revenue.body", {
              bold: (chunks) => (
                <strong className="text-white font-medium">{chunks}</strong>
              ),
            })}
          </p>
        </div>
        <p className="text-xs text-neutral-600 mt-6 text-center">
          {t("footer_note")}
        </p>
      </motion.div>
    </section>
  );
}
