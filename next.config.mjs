import createNextIntlPlugin from "next-intl/plugin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const withNextIntl = createNextIntlPlugin("./src/core/i18n/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   esmExternals: "loose", // <-- add this
  //   serverComponentsExternalPackages: ["mongoose"], // <-- and this
  // },
  // // and the following to enable top-level await support for Webpack
  // webpack: (config) => {
  //   config.experiments = {
  //     topLevelAwait: true,
  //   };
  //   return config;
  // },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        crypto: require.resolve("crypto-browserify"),
      };
      config.resolve.alias["node:crypto"] =
        require.resolve("crypto-browserify");
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
