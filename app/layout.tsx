import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";

export const metadata = { title: "Колючка", description: "Помощник между медицинскими контактами" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body><ThemeScript />{children}</body></html>;
}
