const path = require("path");
const webpack = require("webpack");

module.exports = {
  webpack: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets/"),
      "@components": path.resolve(__dirname, "src/Components/"),
      "@shared": path.resolve(__dirname, "src/shared/"),
      "@utils": path.resolve(__dirname, "src/utils/"),
    },
    plugins: [
      new webpack.ProvidePlugin({
        THREE: "three",
      }),
    ],
  },
};
