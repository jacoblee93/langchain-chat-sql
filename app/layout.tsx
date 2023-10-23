import "./globals.css";
import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Talk to SQL With LangChain.js</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="Template showing how to query your SQL database with natural language. See source code and deploy your own at https://github.com/jacoblee93/langchain-chat-sql!"
        />
        <meta property="og:title" content="Talk to SQL With LangChain.js" />
        <meta
          property="og:description"
          content="Template showing how to query your SQL database with natural language. See source code and deploy your own at https://github.com/jacoblee93/langchain-chat-sql!"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talk to SQL With LangChain.js" />
        <meta
          name="twitter:description"
          content="Template showing how to query your SQL database with natural language. See source code and deploy your own at https://github.com/jacoblee93/langchain-chat-sql!"
        />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={publicSans.className}>
        <div className="flex flex-col p-4 md:p-12 h-[100vh]">{children}</div>
      </body>
    </html>
  );
}
