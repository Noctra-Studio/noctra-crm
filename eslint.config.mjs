import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.js",
    "*.sh",
    "*.py",
  ]),
  {
    rules: {
      "react/no-unknown-property": [
        "warn",
        {
          ignore: [
            "attach",
            "args",
            "transparent",
            "wireframe",
            "opacity",
            "depthWrite",
            "sizeAttenuation",
            "frustumCulled",
            "positions",
            "stride",
            "cellSize",
            "cellThickness",
            "cellColor",
            "sectionSize",
            "sectionThickness",
            "sectionColor",
            "fadeDistance",
            "fadeStrength",
            "infiniteGrid",
            "distort",
            "speed",
            "emissive",
            "emissiveIntensity",
            "roughness",
            "metalness",
            "jsx",
            "global",
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
