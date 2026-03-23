import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.txt": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  webpack: (config) => {
    // ?raw サフィックスでファイルをテキスト文字列としてインポート可能にする
    // (Vite の ?raw と同等。builtin-api-typedefs.txt 等をMonaco Editorに渡す用途)
    config.module.rules.push({
      resourceQuery: /raw/,
      use: "raw-loader",
      type: "javascript/auto",
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
