import type { ReactNode } from "react";
import "../app/globals.css";

export const metadata = {
  title: "PLANLUX PRODUKCJA PLANDEK",
  description: "System zarządzania produkcją dla Planlux"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

