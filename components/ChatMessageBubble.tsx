export function ChatMessageBubble(props: { message: { role: string, content: string, sql?: string }, aiEmoji?: string }) {
  const colorClassName =
    props.message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = props.message.role === "user" ? "🧑" : props.aiEmoji;
  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="mr-2">
        {prefix}
      </div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
        {props.message.sql ? (
          <div className="flex flex-col">
            <code className="mt-1 mr-2 bg-slate-600 px-2 py-1 rounded text-xs mr-auto">Generated SQL:</code>
            <code className="mt-1 mr-2 bg-slate-600 px-2 py-1 rounded text-xs">{props.message.sql}</code>
          </div>
        ) : ""}
      </div>
    </div>
  );
}