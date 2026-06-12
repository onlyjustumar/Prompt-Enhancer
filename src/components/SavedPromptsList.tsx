import { Trash2, Copy, Check, Sparkles, Film, Video, Image as ImageIcon, Calendar } from "lucide-react";
import { useState, MouseEvent } from "react";
import { SavedPromptItem } from "../types";

interface SavedPromptsListProps {
  items: SavedPromptItem[];
  onSelect: (item: SavedPromptItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function SavedPromptsList({
  items,
  onSelect,
  onDelete,
  onClearAll,
}: SavedPromptsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50">
        <Sparkles className="w-6 h-6 text-stone-400 mb-2.5" />
        <p className="text-xs font-semibold text-stone-700">No prompt history yet</p>
        <p className="text-[11px] text-stone-400 mt-0.5">Your optimized requests will be saved here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200/60">
            {items.length}
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">History Log</h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-900 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {items.map((item) => {
          const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative flex flex-col p-3.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50/80 hover:border-stone-400 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {item.purpose === "documentary" && (
                    <span className="text-stone-700 text-xs">🎬</span>
                  )}
                  {item.purpose === "video" && (
                    <span className="text-stone-700 text-xs">📱</span>
                  )}
                  {item.purpose === "image" && (
                    <span className="text-stone-700 text-xs">🖼️</span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {item.purpose}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopy(item.id, item.enhancedPrompt, e)}
                    className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                    title="Copy Enhanced Prompt"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs font-semibold text-stone-900 line-clamp-1 group-hover:text-stone-700">
                "{item.basePrompt}"
              </p>

              <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 px-1.5 border-l border-stone-200 italic font-serif">
                {item.enhancedPrompt}
              </p>

              <div className="flex items-center gap-1 text-[9px] text-stone-400 mt-2.5 font-mono">
                <Calendar className="w-2.5 h-2.5" />
                <span>{formattedDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

