import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/context/ProfileContext";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kairos — Cook what you already have",
  description:
    "Snap your fridge. Kairos reads your ingredients, filters them through your allergy and diet profile, and builds a recipe you can cook hands-free.",
};

export const viewport = {
  themeColor: "#08090a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
