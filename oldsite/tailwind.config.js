const tokens = require('@contentful/f36-tokens');
const { fontFamily } = require('tailwindcss/defaultTheme');

let colors = Object.entries(tokens).reduce((acc, [key, value]) => {
  // Filter Hex colors from the f36-tokens
  if (/^#[0-9A-F]{6}$/i.test(value)) {
    acc[key] = value;
  }

  return acc;
}, {});

colors = {
  ...colors,
  colorPrimary: '#1D9ACC', // blue
  colorNegative: '#CC082C', // red
  colorWarning: '#CCC429', // yellow
  colorBlueLightest: '#E8F5FF', // blue100
  colorBlueLight: '#99DFF8', // blue300
  colorBlueMid: '#66CFF4', // blue400
  colorBlueBase: '#1D9ACC', // blue500
  colorBlueDark: '#1988B2', // blue600
  blue100: '#E8F5FF',  // Lightest shade of your primary color
  blue200: '#CCEFFB',  // Lighter shade
  blue300: '#99DFF8',  // Light shade
  blue400: '#66CFF4',  // Slightly lighter primary color
  blue500: '#1D9ACC',  // Your primary color
  blue600: '#1988B2',  // Slightly darker primary color
  blue700: '#146E8F',  // Dark shade
  blue800: '#105577',  // Darker shade
  blue900: '#0C3C5F',  // Darkest shade of your primary color
  colorRedLightest: '#FFE6E8', // red100
  colorRedLight: '#FF9DA5', // red300
  colorRedMid: '#FF7884', // red400
  colorRedBase: '#CC082C', // red500
  colorRedDark: '#A80725', // red600
  red100: '#FFE6E8',   // Lightest shade of your negative color
  red200: '#FFC2C7',   // Lighter shade
  red300: '#FF9DA5',   // Light shade
  red400: '#FF7884',   // Slightly lighter negative color
  red500: '#CC082C',   // Your negative color
  red600: '#A80725',   // Slightly darker negative color
  red700: '#85061F',   // Dark shade
  red800: '#680419',   // Darker shade
  red900: '#510313',   // Darkest shade of your negative color
  colorYellowLightest: '#FFF9E5', // yellow100
  colorYellowLight: '#FFEFB2', // yellow300
  colorYellowMid: '#FFEB99', // yellow400
  colorYellowBase: '#CCC429', // yellow500
  colorYellowDark: '#A89F22', // yellow600
  yellow100: '#FFF9E5', // Lightest shade of your warning color
  yellow200: '#FFF4CC', // Lighter shade
  yellow300: '#FFEFB2', // Light shade
  yellow400: '#FFEB99', // Slightly lighter warning color
  yellow500: '#CCC429', // Your warning color
  yellow600: '#A89F22', // Slightly darker warning color
  yellow700: '#867A1C', // Dark shade
  yellow800: '#686016', // Darker shade
  yellow900: '#51470F', // Darkest shade of your warning color
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors,
    extend: {
      maxWidth: {
        '8xl': '90rem',
      },
      letterSpacing: {
        snug: '-0.011em',
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      lineHeight: {
        tighter: 1.1,
      },
      fontFamily: {
        serif: ['Newsreader', ...fontFamily.serif],
        sans: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        pem: {
          primary: "#a991f7",
          secondary: "#f6d860",
          accent: "#37cdbe",
          neutral: "#3d4451",
          "base-100": "#ffffff",

          "--rounded-box": "0rem", // border radius rounded-box utility class, used in card and other large boxes
          "--rounded-btn": "0rem", // border radius rounded-btn utility class, used in buttons and similar element
          // "--rounded-badge": "1.9rem", // border radius rounded-badge utility class, used in badges and similar
          // "--animation-btn": "0.25s", // duration of animation when you click on button
          // "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
          // "--btn-text-case": "uppercase", // set default text transform for buttons
          // "--btn-focus-scale": "0.95", // scale transform of button when you focus on it
          // "--border-btn": "1px", // border width of buttons
          // "--tab-border": "1px", // border width of tabs
          // "--tab-radius": "0.5rem", // border radius of tabs
        },
      },
    ],
  },
};
