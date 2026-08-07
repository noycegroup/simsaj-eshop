import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sites/vinext serves local public assets directly. Disabling the Next image
  // proxy keeps logos and product photos available on the deployed worker.
  images: { unoptimized: true },
};

export default nextConfig;
