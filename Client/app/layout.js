import "./globals.css";

export const metadata = {
  title: "Real-time Chat",
  description: "Chat app using Next.js + Node.js + MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="mdl-js">
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}

