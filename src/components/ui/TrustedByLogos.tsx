import React from "react";
import Image from "next/image";
import { SiDocker, SiAmazon, SiNubank, SiTata } from "react-icons/si";

const logos = [
  { name: "Globant", width: 120, Component: null, image: null },
  { name: "Docker", width: 100, Component: SiDocker, image: null },
  { name: "Linio", width: 80, Component: null, image: null },
  { name: "Concentrix", width: 140, Component: null, image: null },
  { name: "Amazon México", width: 150, Component: SiAmazon, image: null },
  { name: "TCS", width: 60, Component: SiTata, image: null },
  { name: "NU", width: 50, Component: SiNubank, image: null },
  { name: "STP", width: 60, Component: null, image: "/images/logos/stp.png" },
  {
    name: "BMV",
    width: 80,
    Component: null,
    image: "/images/logos/bmv_text.png",
  },
];

export function TrustedByLogos() {
  return (
    <div className="w-full py-8 border-t border-white/10 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 md:gap-12 items-center justify-items-start opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        {logos.map((logo) => (
          <div key={logo.name} className="flex items-center justify-center">
            {logo.image ? (
              <div className="relative h-8 w-auto">
                <Image
                  src={logo.image}
                  alt={logo.name}
                  height={32}
                  width={logo.width}
                  className="h-8 w-auto object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ) : logo.Component ? (
              <div className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                <logo.Component className="w-8 h-8" />
                <span className="text-lg font-bold tracking-tight">
                  {logo.name}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold tracking-tight text-neutral-400 hover:text-white transition-colors font-mono">
                {logo.name.toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
