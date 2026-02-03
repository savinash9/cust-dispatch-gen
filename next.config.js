/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_OPENAI_AVAILABLE: process.env.OPENAI_API_KEY ? "true" : "false"
  }
};

module.exports = nextConfig;
