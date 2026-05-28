import MarkdownEditor from "./MarkdownEditor";

export default function TopicContentEditor({ content, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
        Content
      </label>
      <MarkdownEditor value={content || ""} onChange={onChange} height={320} />
    </div>
  );
}
