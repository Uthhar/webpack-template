module.exports = {
  plugins: {
    autoprefixer: {
      grid: true,
    },
    "css-mqpacker": {
      sort: true,
    },
    cssnano: {
      preset: [
        "default",
        {
          cssDeclarationSorter: false,
        },
      ],
    },
  },
};
