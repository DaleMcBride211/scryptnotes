import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "@/styles/globals.css";
import Header from "@/components/Header";


export const metadata: Metadata = {
  title: "Scrypt Notes",
  description: "This is my note app that uses Next.js and AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <div className="flex min-h-screen width-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col px-4 pt-10 xl:px-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
