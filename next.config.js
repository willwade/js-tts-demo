/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude sherpa-onnx-node from the client-side bundle
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        'sherpa-onnx-node',
        'sherpa-onnx-darwin-arm64',
        'sherpa-onnx-darwin-x64',
        'sherpa-onnx-linux-x64',
        'sherpa-onnx-win-x64',
      ];
    }

    // Add a rule to handle binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
      exclude: /node_modules/,
    });

    return config;
  },
};

module.exports = nextConfig;
