"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  SiPython,
  SiMongodb,
  SiMysql,
  SiSupabase,
  SiPostgresql,
  SiShopify,
  SiPayloadcms,
  SiCloudflare,
  SiGithubactions,
  SiGooglecloud,
  SiFigma,
  SiAdobe,
  SiHotjar,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiGreensock,
  SiNodedotjs,
  SiSanity,
  SiStrapi,
  SiContentful,
  SiVercel,
  SiAmazon,
  SiDocker,
} from "react-icons/si";
import { FaUserFriends, FaFlask } from "react-icons/fa";

/**
 * TechStack
 * Purpose: Displays the "Technical Specification" grid of technologies used.
 * Key Features:
 * - Categorized tech list (Frontend, Backend, CMS, Infrastructure)
 * - Uses official brand icons (Simple Icons)
 * - "Blueprint" aesthetic styling
 */
function CategoryCard({ category }: { category: { title: string; items: { label: string; icon: React.ComponentType<{ className?: string }> }[] } }) {
  return (
    <div className="flex flex-col h-full border-b border-r border-neutral-200 dark:border-neutral-800">
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        <h3 className="text-xs font-mono text-neutral-300 dark:text-neutral-400 uppercase tracking-widest">
          {category.title}
        </h3>
      </div>
      <div className="flex-1 flex flex-col">
        {category.items.map((item) => (
          <div
            key={item.label}
            className="group flex items-center gap-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-200 cursor-default">
            <item.icon className="w-5 h-5 text-neutral-900 dark:text-neutral-50" />
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechStack() {
  const t = useTranslations("AboutPage.tech_radar");

  const categories = [
    {
      title: t("ui_ux"),
      items: [
        { label: "Figma", icon: SiFigma },
        { label: "Adobe Creative Suite", icon: SiAdobe },
        { label: "User Personas", icon: FaUserFriends },
        { label: "A/B Testing", icon: FaFlask },
        { label: "Heatmaps (Hotjar)", icon: SiHotjar },
      ],
    },
    {
      title: t("frontend"),
      items: [
        { label: "Next.js", icon: SiNextdotjs },
        { label: "React", icon: SiReact },
        { label: "TypeScript", icon: SiTypescript },
        { label: "Tailwind", icon: SiTailwindcss },
        { label: "GSAP", icon: SiGreensock },
      ],
    },
    {
      title: t("backend_db"),
      items: [
        { label: "Node.js", icon: SiNodedotjs },
        { label: "Python", icon: SiPython },
        { label: "Supabase", icon: SiSupabase },
        { label: "PostgreSQL", icon: SiPostgresql },
        { label: "MongoDB", icon: SiMongodb },
        { label: "MySQL", icon: SiMysql },
      ],
    },
    {
      title: t("cms"),
      items: [
        { label: "Sanity", icon: SiSanity },
        { label: "Shopify (Hydrogen)", icon: SiShopify },
        { label: "Payload CMS", icon: SiPayloadcms },
        { label: "Strapi", icon: SiStrapi },
        { label: "Contentful", icon: SiContentful },
      ],
    },
    {
      title: t("infrastructure"),
      items: [
        { label: "Vercel", icon: SiVercel },
        { label: "AWS", icon: SiAmazon },
        { label: "Cloudflare", icon: SiCloudflare },
        { label: "GitHub Actions", icon: SiGithubactions },
        { label: "Google Cloud Platform", icon: SiGooglecloud },
        { label: "Docker", icon: SiDocker },
      ],
    },
  ];

  const topRowItems = categories.slice(0, 3);
  const bottomRowItems = categories.slice(3, 5);

  return (
    <div className="w-full border-t border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {topRowItems.map((category) => (
          <CategoryCard key={category.title} category={category} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {bottomRowItems.map((category) => (
          <CategoryCard key={category.title} category={category} />
        ))}
      </div>
    </div>
  );
}
