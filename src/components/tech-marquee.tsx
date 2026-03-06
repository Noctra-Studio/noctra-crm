"use client";

import {
  SiNextdotjs,
  SiReact,
  SiFigma,
  SiTailwindcss,
  SiNodedotjs,
  SiPostgresql,
  SiSupabase,
  SiPython,
  SiVercel,
  SiAmazon,
  SiCloudflare,
  SiMysql,
  SiMongodb,
  SiDocker,
  SiGithubactions,
  SiAdobe,
  SiGreensock,
  SiShopify,
  SiPayloadcms,
  SiStrapi,
  SiContentful,
  SiGooglecloud,
  SiTypescript,
} from "react-icons/si";
import { LazyMotion, m, domAnimation } from "framer-motion";

const icons = [
  { icon: SiNextdotjs, label: "Next.js" },
  { icon: SiReact, label: "React" },
  { icon: SiFigma, label: "Figma" },
  { icon: SiTailwindcss, label: "Tailwind" },
  { icon: SiNodedotjs, label: "Node.js" },
  { icon: SiPostgresql, label: "PostgreSQL" },
  { icon: SiSupabase, label: "Supabase" },
  { icon: SiPython, label: "Python" },
  { icon: SiVercel, label: "Vercel" },
  { icon: SiAmazon, label: "AWS" },
  { icon: SiCloudflare, label: "Cloudflare" },
  { icon: SiMysql, label: "MySQL" },
  { icon: SiMongodb, label: "MongoDB" },
  { icon: SiDocker, label: "Docker" },
  { icon: SiGithubactions, label: "GitHub Actions" },
  { icon: SiAdobe, label: "Adobe" },
  { icon: SiGreensock, label: "GSAP" },
  { icon: SiShopify, label: "Shopify" },
  { icon: SiPayloadcms, label: "Payload" },
  { icon: SiStrapi, label: "Strapi" },
  { icon: SiContentful, label: "Contentful" },
  { icon: SiGooglecloud, label: "GCP" },
  { icon: SiTypescript, label: "TypeScript" },
];

export function TechMarquee() {
  return (
    <LazyMotion features={domAnimation}>
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-neutral-950 md:shadow-xl">
      <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
        <m.div
          className="flex flex-none gap-12 py-4 pr-12"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}>
          {[...icons, ...icons].map((item, idx) => (
            <div
              key={`${idx}-${item.label}`}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-300">
              <item.icon className="h-8 w-8" />
              <span className="text-sm font-mono uppercase tracking-wider hidden md:block">
                {item.label}
              </span>
            </div>
          ))}
        </m.div>
      </div>
    </div>
    </LazyMotion>
  );
}
