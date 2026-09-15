import "./globals.css";

export const metadata = {
  title: "The Family Man Planner",
  description: "Rhythms, weeks, months, and ideas for intentional fatherhood.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
