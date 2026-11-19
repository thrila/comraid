import LocalFont from "next/font/local";

export const helvetica_neue = LocalFont({
  src: [
    {
      path: "./Helvetica_neue/HelveticaNeueMedium.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Helvetica_neue/HelveticaNeueItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "./Helvetica_neue/HelveticaNeueBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-neue",
});
