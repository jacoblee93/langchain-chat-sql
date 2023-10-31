import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">
        💾 Talk to SQL With LangChain.js 🦜🔗
      </h1>
      <ul>
        <li className="text-l">
          💾
          <span className="ml-2">
            This{" "}
            <a href="https://nextjs.org/" target="_blank">
              Next.js
            </a>{" "}
            template shows how to query a SQL database with natural language{" "}
          </span>
        </li>
        <li>
          💡
          <span className="ml-2">
            It queries a serverless{" "}
            <a href="https://neon.tech/" target="_blank">
              Neon DB
            </a>{" "}
            Postgres instance running the{" "}
            <a
              href="https://github.com/lerocha/chinook-database"
              target="_blank"
            >
              Chinook
            </a>{" "}
            demo database.
          </span>
        </li>
        <li>
          🎭
          <span className="ml-2">
            This sample DB represents a digital media store, including tables
            for artists, albums, media tracks, invoices, and customers.
          </span>
        </li>
        <li className="hidden text-l md:block">
          💻
          <span className="ml-2">
            You can find the prompt and model logic for this use-case in{" "}
            <code>app/api/chat/route.ts</code>.
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            The main frontend logic is found in <code>app/page.tsx</code>.
          </span>
        </li>
        <li className="text-l">
          🐙
          <span className="ml-2">
            This template is open source - you can see the source code and
            deploy your own version{" "}
            <a
              href="https://github.com/jacoblee93/langchain-chat-sql"
              target="_blank"
            >
              from the GitHub repo
            </a>
            !
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            Try asking e.g. <code>Who works here?</code> below!
          </span>
        </li>
      </ul>
    </div>
  );
  return (
    <ChatWindow
      endpoint="api/chat"
      emoji="💬"
      titleText="Chat with SQL"
      placeholder="Who works here?"
      emptyStateComponent={InfoCard}
    ></ChatWindow>
  );
}
