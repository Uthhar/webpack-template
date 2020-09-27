const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const devMode = process.env.NODE_ENV !== "production";
const prodMode = !devMode;

const optimization = () => {
  const config = {};

  if (prodMode) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
};

const cssLoaders = (extra) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: devMode,
        reloadAll: true,
      },
    },
    "css-loader",
    "postcss-loader",
  ];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

const jsLoaders = () => {
  const loaders = [{ loader: "babel-loader" }];

  if (devMode) {
    loaders.push("eslint-loader");
  }

  return loaders;
};

const generateHtmlPlugins = (templateDir) => {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));

  return templateFiles.map((item) => {
    const parts = item.split(".");
    const name = parts[0];
    const extension = parts[1];
    return new HtmlWebpackPlugin({
      filename: `${name}.${extension}`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
    });
  });
};

const plugins = () => {
  const plugins = [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/img"),
          to: path.resolve(__dirname, "dist/img"),
          noErrorOnMissing: true,
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? "css/[name].css" : "css/[name].[contenthash].css",
    }),
    // new HtmlWebpackPlugin({
    //   template: "./index.html",
    // }),
  ];

  if (prodMode) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return plugins.concat(
    generateHtmlPlugins(path.resolve(__dirname, "src/pages"))
  );

  // return plugins;
};

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: {
    main: ["@babel/polyfill", "./index.js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: devMode ? "js/[name].js" : "js/[name].[contenthash].js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@js": path.resolve(__dirname, "src/js"),
      "@css": path.resolve(__dirname, "src/css"),
      "@scss": path.resolve(__dirname, "src/scss"),
      "@fonts": path.resolve(__dirname, "src/fonts"),
      "@img": path.resolve(__dirname, "src/img"),
    },
  },
  optimization: optimization(),
  devServer: {
    port: 4400,
    hot: devMode,
  },
  devtool: devMode ? "source-map" : "",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.css$/,
        use: cssLoaders(),
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders("sass-loader"),
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "fonts",
            publicPath: "fonts",
          },
        },
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif|webp)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "img",
            publicPath: "img",
          },
        },
      },
    ],
  },
  plugins: plugins(),
};
