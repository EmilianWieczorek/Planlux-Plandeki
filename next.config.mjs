/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output is safer for Electron packaging:
  // produces a self-contained server entry under .next/standalone.
  output: "standalone"
};

export default nextConfig;
