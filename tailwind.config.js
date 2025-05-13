// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(alert|avatar|button|card|code|divider|dropdown|input|modal|progress|table|tabs|toast|popover|ripple|spinner|menu|form|checkbox|spacer).js"
],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};