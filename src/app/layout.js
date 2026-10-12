import "./globals.css";
import { Poppins, Parisienne, Playfair_Display_SC } from "next/font/google";
import Navbar from "@/Component/Navbar/navbar";
import FloatingIcons from "@/Component/FloatingIcons";
import SmoothScroll from "@/Component/Common/SmoothScroll";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap", // Improve LCP by showing fallback font first
});

const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-parisienne",
  display: "swap",
});

const playfairSC = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair-sc",
  display: "swap",
});

export const metadata = {
  title: "Islamabad Prime Builders | Premium Real Estate & Construction",
  description: "Experience luxury living with Islamabad Prime Builders. We create innovative communities and premium developments with international quality standards.",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="selection:bg-[#d1b38c]/30">
      <body
        className={`${poppins.className} ${parisienne.variable} ${playfairSC.variable} antialiased bg-white text-black overflow-x-hidden`}
      >
        <SmoothScroll>
          <Navbar />
          {children}
          <FloatingIcons />
        </SmoothScroll>
      </body>
    </html>
  );
}
