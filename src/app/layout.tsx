import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "ระบบบันทึกข้อมูลการดูแลกลุ่มเป้าหมาย",
  description: "Community Nurse Volunteer Work Log System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans antialiased`}>
        <NextTopLoader
          color="#4f46e5"
          initialPosition={0.08}
          crawlSpeed={200}
          height={4}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #4f46e5,0 0 5px #4f46e5"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
