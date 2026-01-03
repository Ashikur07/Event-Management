import './globals.css';

// ১. মেটাডাটা (Metadata)
export const metadata = {
  title: "ICT Reunion | Kit Manager",
  description: "Efficiently manage and track the distribution of reunion kits, gifts, and food items for ICT Dept students.",
  manifest: "/manifest.json",
  // iOS এর জন্য এক্সট্রা কনফিগ
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KitManager",
  },
  // আইকন লিংক (iOS এবং ব্রাউজারের জন্য)
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
};

// ২. ভিউপোর্ট (Viewport)
export const viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}