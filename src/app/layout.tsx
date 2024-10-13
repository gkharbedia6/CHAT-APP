import "@/styles/globals.css";

import Providers from "@/components/Providers";

export const metadata = {
  title: "CHATAPP",
  description: "Chat up with random characters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
