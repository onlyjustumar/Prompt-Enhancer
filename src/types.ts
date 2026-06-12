export type PurposeType = "documentary" | "video" | "image";

export interface ProjectSettings {
  tone?: string;
  targetAudience?: string;
  platform?: string;
  artStyle?: string;
  lighting?: string;
  mood?: string;
  colorPalette?: string;
  composition?: string;
}

export interface PromptVariation {
  name: string;
  prompt: string;
}

export interface EnhancementResponse {
  status: "success" | "clarification_needed";
  clarifyingQuestion?: string;
  enhancedPrompt?: string;
  whyItWorks?: string;
  proTips?: string[];
  variations?: PromptVariation[];
}

export interface SavedPromptItem {
  id: string;
  basePrompt: string;
  purpose: PurposeType;
  settings: ProjectSettings;
  enhancedPrompt: string;
  whyItWorks?: string;
  proTips?: string[];
  variations?: PromptVariation[];
  timestamp: number;
}
