import { useState } from 'react';
import { Sparkles, AlertCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-[#0a0a0a] text-red-400 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let k = 0;

  const flushList = () => {
    if (!listItems.length) return;
    elements.push(
      <ul key={k++} className="list-none space-y-1 my-2 ml-1">
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const line of lines) {
    const bullet   = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^\d+\.\s+(.+)/);
    if (bullet || numbered) {
      listItems.push((bullet || numbered)[1]);
    } else {
      flushList();
      if (line.trim() === '') {
        if (elements.length) elements.push(<div key={k++} className="h-1.5" />);
      } else {
        elements.push(
          <p key={k++} className="text-sm leading-relaxed text-zinc-300">{renderInline(line)}</p>
        );
      }
    }
  }
  flushList();
  return elements;
}

function MessageBubble({ message, isUser, sources = [], isError = false }) {
  const [showSources, setShowSources] = useState(false);
  const hasSources = !isUser && sources?.length > 0;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] px-4 py-3 bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl rounded-br-sm text-white text-sm leading-relaxed shadow-lg shadow-red-500/20">
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[82%]">
        {/* AI label */}
        <div className="flex items-center gap-1.5 mb-1.5 ml-1">
          {isError
            ? <AlertCircle size={11} className="text-red-400" />
            : <div className="w-4 h-4 rounded bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center"><Sparkles size={8} className="text-white" /></div>
          }
          <span className="text-[11px] text-zinc-600 font-medium">{isError ? 'Error' : 'AI Assistant'}</span>
        </div>

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl rounded-tl-sm border ${
          isError
            ? 'bg-red-900/20 border-red-500/20 text-red-300'
            : 'bg-[#1a1a1a] border-white/8 text-zinc-300'
        }`}>
          <div className="space-y-0.5">{renderMarkdown(message)}</div>
        </div>

        {/* Sources */}
        {hasSources && (
          <div className="mt-2 ml-1">
            <button
              onClick={() => setShowSources((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              <BookOpen size={11} />
              <span>{sources.length} source{sources.length > 1 ? 's' : ''}</span>
              {showSources ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
            {showSources && (
              <div className="mt-2 space-y-1.5">
                {sources.map((s, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-white/8 rounded-xl px-3 py-2 text-xs">
                    {(s.page || s.chapter) && (
                      <div className="flex items-center gap-2 mb-1">
                        {s.page    && <span className="text-red-400/80 font-medium">Pg {s.page}</span>}
                        {s.chapter && <span className="text-zinc-600">· Ch {s.chapter}</span>}
                      </div>
                    )}
                    <p className="text-zinc-600 italic leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
