module.exports = {
  content: ["./**/*.{ts,tsx}"],
  theme: {},
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#7B61FF",
          secondary: "#EA404E",
          accent: "#019380",
          neutral: "#3D4451",
          "base-100": "#000000",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
