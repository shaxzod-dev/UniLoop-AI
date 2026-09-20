import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep parallel QA mock/dev artifacts separate from the normal real-mode build.
  distDir: process.env.NEXT_OUTPUT_DIR ?? ".next",
};

export default nextConfig;
