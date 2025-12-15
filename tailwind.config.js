/** @type {import('tailwindcss').Config} */
module.exports = {
  // all files using className
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // this is important for NativeWind v4
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
