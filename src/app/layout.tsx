import type { Metadata } from "next";
import { Geist, Poppins, Bungee, Inter } from "next/font/google";
import "antd/dist/reset.css";
import "@/src/styles/global.css";
import "@/src/lib/nprogress";
import "@/src/lib/AxiosInterceptor";
import NProgressProvider from "./NProgressProvider";
import AntProviders from "./AntProvider";
import { ReactQueryProvider } from "@/src/providers/ReactQueryProvider";
import ToastContainer from "@/src/components/ui/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bungee = Bungee({
  weight: "400", // Bungee only has 400
  subsets: ["latin"], // required subset
  variable: "--font-bungee", // optional CSS variable
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beldium",
  description: "Global Compliant Lithium Infrastructure",
  openGraph: {
    title: "Beldium",
    description: "Global Compliant Lithium Infrastructure",
    siteName: "Beldium",
    images: ["/assets/images/logo.png"],
  },
  twitter: {
    card: "summary",
    title: "Beldium",
    description: "Global Compliant Lithium Infrastructure",
    images: ["/assets/images/logo.png"],
  },
  icons: {
    icon: "/assets/images/logo.png",
    shortcut: "/assets/images/logo.png",
    apple: "/assets/images/logo.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${poppins.variable} ${bungee.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AntProviders>
            <NProgressProvider>
              {children}
              <ToastContainer />
            </NProgressProvider>
          </AntProviders>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
