import { useState } from "react";
import { Copy, Check, Sparkles, BookOpen, Eye, Zap, ListChecks } from "lucide-react";
import { EnhancementResponse, PurposeType } from "../types";

interface PromptResultsProps {
  result: EnhancementResponse;
  purpose: PurposeType;
  basePrompt: string;
}

export default function PromptResults({ result, purpose, basePrompt }: PromptResultsProps) {
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [copiedVarIdx, setCopiedVarIdx] = useState<number | null>(null);

  const handleCopyEnhanced = async () => {
    if (!result.enhancedPrompt) return;
    try {
      await navigator.clipboard.writeText(result.enhancedPrompt);
      setCopiedEnhanced(true);
      setTimeout(() => setCopiedEnhanced(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyVar = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVarIdx(idx);
      setTimeout(() => setCopiedVarIdx(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 flex flex-col mt-8 space-y-8 animate-fade-in">
      
      {/* Top Header Label banner */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-wider rounded-md">
          Optimized Result
        </span>
        <div className="h-px flex-1 bg-stone-100"></div>
      </div>

      {/* Main Enhanced Prompt block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
            <span>✨</span> Enhanced Prompt
          </h3>
          <button
            onClick={handleCopyEnhanced}
            className="text-xs font-semibold text-stone-400 hover:text-stone-900 uppercase tracking-widest flex items-center gap-2 transition-colors duration-150"
            title="Copy to Clipboard"
          >
            {copiedEnhanced ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <span>Copy to Clipboard</span>
                <Copy className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="p-5 rounded-xl bg-stone-50 border border-stone-100 relative group">
          <pre className="text-stone-800 leading-relaxed font-mono text-sm whitespace-pre-wrap select-all font-medium">
            {result.enhancedPrompt}
          </pre>
        </div>
      </div>

      {/* Why This Works & Pro Tips breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
        
        {result.whyItWorks && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-stone-500" />
              📌 Why This Works
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans font-medium">
              {result.whyItWorks}
            </p>
          </div>
        )}

        {result.proTips && result.proTips.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-stone-500" />
              💡 Pro Tips
            </h4>
            <ul className="text-xs text-stone-600 space-y-1.5 font-medium">
              {result.proTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-stone-400 rounded-full mt-1.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Alternate variations section if present */}
      {result.variations && result.variations.length > 0 && (
        <div className="pt-6 border-t border-stone-100 space-y-4">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-stone-500" />
            🔁 Alternative Variations
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            {result.variations.map((v, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all flex flex-col justify-between gap-3 shadow-inner"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider bg-stone-100 px-2 py-0.5 rounded">
                      {v.name}
                    </span>
                    <button
                      onClick={() => handleCopyVar(v.prompt, idx)}
                      className="text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      {copiedVarIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Option</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-stone-700 whitespace-pre-wrap mt-2.5 leading-relaxed bg-white p-3 rounded border border-stone-200/60 font-medium">
                    {v.prompt}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

