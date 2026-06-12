import { useState, useEffect, FormEvent } from "react";
import { 
  Sparkles, 
  Film, 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  ChevronRight, 
  Settings, 
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Clock,
  Check,
  Copy,
  SlidersHorizontal,
  Info
} from "lucide-react";
import { 
  PurposeType, 
  ProjectSettings, 
  EnhancementResponse, 
  SavedPromptItem 
} from "./types";
import SavedPromptsList from "./components/SavedPromptsList";
import PromptResults from "./components/PromptResults";

export default function App() {
  const [basePrompt, setBasePrompt] = useState("");
  const [purpose, setPurpose] = useState<PurposeType>("video");
  const [showSettings, setShowSettings] = useState(false);
  
  // Advanced configuration state
  const [settings, setSettings] = useState<ProjectSettings>({
    tone: "",
    targetAudience: "",
    platform: "YouTube Long-form",
    artStyle: "",
    lighting: "",
    mood: "",
    colorPalette: "",
    composition: ""
  });

  // Flow & API statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnhancementResponse | null>(null);
  
  // Clarification / Refinement State
  const [refinementAnswer, setRefinementAnswer] = useState("");
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptItem[]>([]);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("prompt_engineer_history");
      if (stored) {
        setSavedPrompts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newItem: SavedPromptItem) => {
    const updated = [newItem, ...savedPrompts.filter(item => item.id !== newItem.id)].slice(0, 50);
    setSavedPrompts(updated);
    try {
      localStorage.setItem("prompt_engineer_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const handleClearHistory = () => {
    setSavedPrompts([]);
    try {
      localStorage.removeItem("prompt_engineer_history");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    try {
      localStorage.setItem("prompt_engineer_history", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectHistoryItem = (item: SavedPromptItem) => {
    setBasePrompt(item.basePrompt);
    setPurpose(item.purpose);
    setSettings(item.settings);
    setResult({
      status: "success",
      enhancedPrompt: item.enhancedPrompt,
      whyItWorks: item.whyItWorks,
      proTips: item.proTips,
      variations: item.variations
    });
    setRefinementAnswer("");
    setError(null);
  };

  const executeEnhancement = async (refAnswer: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        prompt: basePrompt,
        purpose,
        ...settings,
        refinementAnswer: refAnswer || undefined
      };

      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to communicate with the Prompt Architect server.");
      }

      const data: EnhancementResponse = await response.json();
      setResult(data);

      if (data.status === "success" && data.enhancedPrompt) {
        // Clear refinement answer on success
        setRefinementAnswer("");
        
        // Save to history
        const newItem: SavedPromptItem = {
          id: Math.random().toString(36).substring(7),
          basePrompt,
          purpose,
          settings: { ...settings },
          enhancedPrompt: data.enhancedPrompt,
          whyItWorks: data.whyItWorks,
          proTips: data.proTips,
          variations: data.variations,
          timestamp: Date.now()
        };
        saveToHistory(newItem);
      }
    } catch (err: any) {
      console.error("Enhancement error", err);
      setError(err.message || "An unexpected error occurred. Please verify your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!basePrompt.trim()) {
      setError("Please put in a vague or primary theme first.");
      return;
    }
    setResult(null);
    executeEnhancement();
  };

  const handleAnswerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!refinementAnswer.trim()) {
      setError("Please put in a brief response to answer the clarifying question.");
      return;
    }
    executeEnhancement(refinementAnswer);
  };

  const handleReset = () => {
    setBasePrompt("");
    setResult(null);
    setRefinementAnswer("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* SIDEBAR (Hidden on mobile, pristine on desktop) */}
      <aside className="hidden md:flex md:w-80 bg-white border-r border-stone-200 flex-col shrink-0 md:h-screen">
        <div className="p-8 flex flex-col flex-1 overflow-y-auto">
          
          {/* Logo / Title section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block text-stone-900">PromptForge</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block -mt-1 font-mono">Architect v3.5</span>
            </div>
          </div>

          {/* Navigation / Selection section */}
          <nav className="space-y-1 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4">Select Purpose</p>
            
            <button
              onClick={() => {
                setPurpose("documentary");
                setResult(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                purpose === "documentary"
                  ? "bg-stone-900 text-white shadow-md shadow-stone-900/10"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <span className="text-lg">🎬</span> Documentary Script
            </button>

            <button
              onClick={() => {
                setPurpose("video");
                setResult(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                purpose === "video"
                  ? "bg-stone-900 text-white shadow-md shadow-stone-900/10"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <span className="text-lg">📱</span> Video Script
            </button>

            <button
              onClick={() => {
                setPurpose("image");
                setResult(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                purpose === "image"
                  ? "bg-stone-900 text-white shadow-md shadow-stone-900/10"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <span className="text-lg">🖼️</span> Image Generation
            </button>
          </nav>

          {/* Real-time refined history list in sidebar */}
          <div className="flex-1 min-h-0 border-t border-stone-100 pt-6">
            <SavedPromptsList
              items={savedPrompts}
              onSelect={handleSelectHistoryItem}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearHistory}
            />
          </div>

        </div>

        {/* Sidebar Footer Welcome segment */}
        <div className="p-8 border-t border-stone-100 bg-stone-50/50">
          <div className="p-4 rounded-xl bg-white border border-stone-200/60 shadow-sm">
            <p className="text-xs text-stone-500 leading-relaxed font-semibold">
              Welcome! I'm your Expert AI Prompt Engineer. Share your simple idea, and I'll turn it into a high-octane creative asset.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto bg-stone-50">
        
        {/* MOBILE TOP BANNER & PURPOSE NAV BAR */}
        <div className="md:hidden bg-white border-b border-stone-200 sticky top-0 z-50 px-6 py-4 flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-stone-900 block font-sans">PromptForge</span>
                <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold block -mt-1 font-mono">v3.5</span>
              </div>
            </div>

            {savedPrompts.length > 0 && (
              <button
                onClick={() => setShowMobileHistory(!showMobileHistory)}
                className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 px-3 py-1.5 bg-stone-100/80 rounded-lg border border-stone-200 flex items-center gap-1 transition-all"
              >
                <span>{showMobileHistory ? "Hide Log" : "History"}</span>
                <span className="inline-flex items-center justify-center bg-stone-200 text-stone-800 rounded-full h-4 min-w-4 text-[9px] px-1 font-mono">
                  {savedPrompts.length}
                </span>
              </button>
            )}
          </div>

          {/* Nav Segment Switchers for mobile */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setPurpose("documentary");
                setResult(null);
                setShowMobileHistory(false);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold font-sans transition-all text-center flex items-center justify-center gap-1.5 border ${
                purpose === "documentary"
                  ? "bg-stone-900 text-white border-transparent shadow"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span>🎬</span> <span>Docu</span>
            </button>

            <button
              onClick={() => {
                setPurpose("video");
                setResult(null);
                setShowMobileHistory(false);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold font-sans transition-all text-center flex items-center justify-center gap-1.5 border ${
                purpose === "video"
                  ? "bg-stone-900 text-white border-transparent shadow"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span>📱</span> <span>Video</span>
            </button>

            <button
              onClick={() => {
                setPurpose("image");
                setResult(null);
                setShowMobileHistory(false);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold font-sans transition-all text-center flex items-center justify-center gap-1.5 border ${
                purpose === "image"
                  ? "bg-stone-900 text-white border-transparent shadow"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span>🖼️</span> <span>Image</span>
            </button>
          </div>

          {/* History drawer if active on mobile */}
          {showMobileHistory && (
            <div className="mt-2 p-4 bg-stone-50 rounded-2xl border border-stone-200 max-h-72 overflow-y-auto animate-slide-down">
              <SavedPromptsList
                items={savedPrompts}
                onSelect={(item) => {
                  handleSelectHistoryItem(item);
                  setShowMobileHistory(false);
                }}
                onDelete={handleDeleteHistoryItem}
                onClearAll={handleClearHistory}
              />
            </div>
          )}
        </div>

        <div className="p-6 md:p-12 flex-1 flex flex-col max-w-4xl w-full mx-auto">
          
          {/* Header Vision */}
          <header className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-stone-900 mb-2">
                What's the <span className="italic font-serif">vision</span>?
              </h1>
              <p className="text-stone-500 text-sm">
                Describe your concept in a few words. I'll handle the comprehensive prompt engineering.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400 uppercase tracking-widest font-bold bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Developer Edition</span>
            </div>
          </header>

          {/* Global Alert Notification block */}
          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                <span className="block font-bold uppercase tracking-wider text-red-700 text-[10px] mb-1">Architecture Notice</span>
                <span>{error}</span>
                {error.includes("GEMINI_API_KEY") && (
                  <div className="mt-2.5 p-3 rounded-lg bg-white border border-red-100 text-stone-600 font-sans">
                    Please use the <strong className="text-stone-900 font-bold">Secrets</strong> panel in AI Studio UI settings (lock icon on top right) to input a valid key named <strong className="text-stone-900 font-bold">GEMINI_API_KEY</strong>.
                  </div>
                )}
                {(error.toLowerCase().includes("depleted") || error.toLowerCase().includes("exhausted") || error.toLowerCase().includes("prepayment") || error.toLowerCase().includes("billing")) && (
                  <div className="mt-2.5 p-3 rounded-lg bg-white border border-red-100 text-stone-600 font-sans space-y-2">
                    <p>This is a billing or quota limit message from Google's Gemini API service. To fix this:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-stone-950 font-bold underline">Google AI Studio Console</a> to check your project billings or top up your prepay credits.</li>
                      <li>Alternatively, set up a new project in AI Studio and configure its key as <strong className="text-stone-900 font-bold">GEMINI_API_KEY</strong> in the <strong className="text-stone-900 font-bold">Secrets</strong> menu on the top-right.</li>
                    </ul>
                  </div>
                )}
              </div>
              <button onClick={() => setError(null)} className="text-xs uppercase tracking-wider font-bold text-red-500 hover:text-red-700 leading-none">
                Dismiss
              </button>
            </div>
          )}

          {/* Prompt Refinement Dialogue */}
          {result && result.status === "clarification_needed" && result.clarifyingQuestion ? (
            <div className="p-8 rounded-3xl border border-stone-200 bg-white shadow-xl space-y-6 animate-fade-in mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                Refinement Dialogue
              </div>

              <h3 className="text-xl font-light tracking-tight text-stone-900">
                Let's customize the model's <span className="font-serif italic font-medium">response variables</span>:
              </h3>

              <blockquote className="p-5 rounded-xl bg-stone-50 border border-stone-100 text-sm text-stone-700 italic font-serif leading-relaxed">
                "{result.clarifyingQuestion}"
              </blockquote>

              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 font-sans">
                    Your Response or Additional Input
                  </label>
                  <textarea
                    rows={3}
                    value={refinementAnswer}
                    onChange={(e) => setRefinementAnswer(e.target.value)}
                    placeholder="e.g. Focus more on the authentic local stories, using close-up macro details and dark lighting palettes..."
                    className="w-full p-4 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 font-sans text-sm outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    Reset Vision
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-stone-800 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Submit Refinement</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            
            /* Workspace Form view */
            <>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Vague primary input text field */}
                <div className="relative">
                  <textarea
                    value={basePrompt}
                    onChange={(e) => {
                      setBasePrompt(e.target.value);
                      setError(null);
                    }}
                    placeholder={
                      purpose === "video"
                        ? "e.g. make a video about climate change"
                        : purpose === "documentary"
                        ? "e.g. a short film about how coffee was discovered"
                        : "e.g. photorealistic dog pilot sitting inside space rocket cockpit"
                    }
                    className="w-full h-36 p-6 pb-20 rounded-2xl border border-stone-200 bg-white shadow-sm focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none resize-none text-lg text-stone-900 placeholder-stone-300 leading-relaxed font-sans"
                  />
                  
                  {/* Pinned prompt trigger action inside current textarea segment */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    {basePrompt && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs uppercase tracking-wider font-bold text-stone-400 hover:text-stone-800 px-3 py-2"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading || !basePrompt.trim()}
                      className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-stone-800 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
                          <span>Architecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Enhance Prompt</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible fine-tune selector drawer */}
                <div className="border border-stone-200 bg-white rounded-2xl p-5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-stone-500"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-stone-800" />
                      Fine-Tune Parameters (Optional)
                    </span>
                    <span className="text-stone-400">{showSettings ? "[- Hide]" : "[+ Expand]"}</span>
                  </button>

                  {showSettings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-stone-100 animate-slide-down">
                      
                      {/* Tone */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 font-mono">
                          Tone or Speaking Style
                        </label>
                        <select
                          value={settings.tone || ""}
                          onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:border-stone-500 focus:bg-white"
                        >
                          <option value="">Let architect select optimal tone</option>
                          <option value="cinematic & atmospheric">Cinematic & atmospheric</option>
                          <option value="conversational & narrative style">Conversational & narrative style</option>
                          <option value="urgent, direct & educational">Urgent, direct & educational</option>
                          <option value="humorous & energetic">Humorous & energetic</option>
                          <option value="analytical & strictly informative">Analytical & strictly informative</option>
                        </select>
                      </div>

                      {/* Target audience */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 font-mono">
                          Target Demographic
                        </label>
                        <select
                          value={settings.targetAudience || ""}
                          onChange={(e) => setSettings({ ...settings, targetAudience: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:border-stone-500 focus:bg-white"
                        >
                          <option value="">Let architect choose default creators</option>
                          <option value="Young adults and content consumers (18-34)">Young adults and content consumers (18-34)</option>
                          <option value="Corporate clients & project engineers">Corporate clients & project engineers</option>
                          <option value="General curious public & documentarians">General curious public & documentarians</option>
                          <option value="Art director/designer professional community">Art director/designer professional community</option>
                        </select>
                      </div>

                      {purpose === "video" && (
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 font-mono">
                            Video Target Layout / Format
                          </label>
                          <select
                            value={settings.platform || ""}
                            onChange={(e) => setSettings({ ...settings, platform: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:border-stone-500 focus:bg-white"
                          >
                            <option value="YouTube Long-form">YouTube Long-form (16:9 Landscape, paced structure)</option>
                            <option value="TikTok Short-form">TikTok (9:16 Portrait, rapid attention grabber)</option>
                            <option value="Instagram Reel / YouTube Short">Instagram Reel / YouTube Short (9:16 high intensity clip)</option>
                          </select>
                        </div>
                      )}

                      {purpose === "image" && (
                        <>
                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 font-mono">
                              Artistic Style / Medium
                            </label>
                            <input
                              type="text"
                              value={settings.artStyle || ""}
                              onChange={(e) => setSettings({ ...settings, artStyle: e.target.value })}
                              placeholder="e.g. vintage film photography, unreal engine 3D, gouache"
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:border-stone-500 focus:bg-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 font-mono">
                              Camera Angle / Composition
                            </label>
                            <input
                              type="text"
                              value={settings.composition || ""}
                              onChange={(e) => setSettings({ ...settings, composition: e.target.value })}
                              placeholder="e.g. close-up rule of thirds macro photography, low-angle drone wide"
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:border-stone-500 focus:bg-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 font-mono">
                              Lighting Layout
                            </label>
                            <input
                              type="text"
                              value={settings.lighting || ""}
                              onChange={(e) => setSettings({ ...settings, lighting: e.target.value })}
                              placeholder="e.g. golden hour volumetric mist, moody chiaroscuro key light"
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:border-stone-500 focus:bg-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 font-mono">
                              Desired Palette
                            </label>
                            <input
                              type="text"
                              value={settings.colorPalette || ""}
                              onChange={(e) => setSettings({ ...settings, colorPalette: e.target.value })}
                              placeholder="e.g. earth slate tones, retro warm pastels, deep navy and cyan"
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:border-stone-500 focus:bg-white font-medium"
                            />
                          </div>
                        </>
                      )}

                    </div>
                  )}
                </div>

              </form>

              {/* Enhanced outputs block */}
              {result && result.status === "success" && (
                <PromptResults 
                  result={result} 
                  purpose={purpose} 
                  basePrompt={basePrompt} 
                />
              )}
            </>
          )}

        </div>

        {/* Decorative corner vector art to complete the Clean Minimalism layout matches */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-stone-100 opacity-60 rounded-tl-full -z-10 translate-x-12 translate-y-12 pointer-events-none border-t border-l border-stone-200" />
      </main>

    </div>
  );
}
