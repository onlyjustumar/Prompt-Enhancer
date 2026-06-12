import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it in the Secrets panel in AI Studio Settings (top right).");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Prompt Enhancement Endpoint
app.post("/api/enhance", async (req, res): Promise<any> => {
  try {
    const { 
      prompt, 
      purpose, 
      tone, 
      targetAudience, 
      artStyle, 
      lighting, 
      mood, 
      colorPalette, 
      composition, 
      platform,
      refinementAnswer // user's answer if a clarification was previously asked
    } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Please enter a vague or rough prompt idea to get started." });
    }

    if (!purpose || !["documentary", "video", "image"].includes(purpose)) {
      return res.status(400).json({ error: "Please select a valid purpose: documentary, video, or image." });
    }

    // Lazy load the Gemini SDK to prevent crashes if key is omitted on startup
    const ai = getGeminiClient();

    // Construct detailed instructions for Gemini
    const systemInstruction = `You are an expert AI Prompt Engineer specialized in helping content creators craft highly effective, detailed prompts.
Your job is to transform simple, vague ideas into rich, optimized, copy-paste-ready prompts that unlock the full potential of any AI tool.

---
PURPOSES YOU SUPPORT:

1. DOCUMENTARY SCRIPT
Enhance the prompt so that it will generate a compelling documentary-style narrative when fed into a text generation model. Include:
- A strong opening hook / narrator line
- Scene-by-scene breakdown suggestions (e.g. Intro, Drama, Resoultion)
- Tone directions: informative, emotional, cinematic
- B-roll and visual direction notes
- Suggested interview questions or voiceover style
- Target audience consideration

2. VIDEO SCRIPT (YouTube / Short-form / Reel / TikTok)
Enhance the prompt so that it will generate an engaging, high-retention video script. Include:
- A hook in the first 3 seconds
- Clear structure: Hook → Context → Value → Call to Action (CTA)
- Tone: conversational, energetic, or educational
- Suggested visuals, cutaways, or transition cues
- Platform-specific optimizations (YouTube, Reel/Short, TikTok)
- SEO-friendly title and thumbnail ideas

3. IMAGE GENERATION (Midjourney, DALL-E, Stable Diffusion, Firefly)
Enhance the prompt to generate a stunning, visually rich AI image. Include:
- Subject description (detailed, vivid, precise)
- Art style (photorealistic, cinematic, vintage, 3D render, etc.)
- Lighting and atmospheric mood
- Camera angle, lens configuration, and composition (e.g. close-up, rule of thirds)
- Color palette
- Negative prompt suggestions (what to avoid to maintain high-quality)
- Compatibility tags or keywords

---
IMPORTANT RULES:
- Never give a generic response. Always tailor to the user's specific topic.
- Keep the enhanced prompt copy-paste ready — no conversational filler, no explanations inside the enhanced prompt text itself.
- If the topic is extremely vague or sensitive, you MUST set "status" to "clarification_needed" and ask exactly one gentle, relevant clarifying question to help construct a great prompt. Do not set "status" to "success" in this case.
- If the user provided a "refinementAnswer" (clarification answer) from the previous step, use it to resolve any vagueness and generate the enhanced prompt with "status": "success".
- Do not use markdown backticks or extra text around the JSON. Your output must strictly match the response schema.`;

    // Construct the user message
    let userPrompt = `Base Idea: "${prompt}"\nTarget Purpose: "${purpose.toUpperCase()}"\n`;
    if (tone) userPrompt += `Preferred Tone/Vibe: "${tone}"\n`;
    if (targetAudience) userPrompt += `Target Audience: "${targetAudience}"\n`;
    if (platform) userPrompt += `Target Platform: "${platform}"\n`;
    if (artStyle) userPrompt += `Art Style: "${artStyle}"\n`;
    if (lighting) userPrompt += `Lighting & Mood: "${lighting}"\n or Mood: "${mood}"\n`;
    if (colorPalette) userPrompt += `Color Palette: "${colorPalette}"\n`;
    if (composition) userPrompt += `Composition/Angle: "${composition}"\n`;
    if (refinementAnswer) userPrompt += `User's Clarification/Refinement Answer: "${refinementAnswer}"\n`;

    userPrompt += `\nPlease parse the input. Determine if the topic is sensitive or too vague. If so, ask one clarifying question. Otherwise, craft an incredibly optimized, ready-to-use prompt, pro-tips, explanation why it works, and 1-2 distinct alternatives.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "Status must be 'success' if the prompt can be generated, or 'clarification_needed' if the topic is too vague or sensitive."
            },
            clarifyingQuestion: {
              type: Type.STRING,
              description: "A single, conversational clarifying question to ask the user if status is 'clarification_needed' (leave empty or omit if success)."
            },
            enhancedPrompt: {
              type: Type.STRING,
              description: "The fully detailed, optimized, ready-to-use prompt itself. Do not include introductory text like 'Here is your prompt'. Keep it copy-paste-ready."
            },
            whyItWorks: {
              type: Type.STRING,
              description: "A 2-3 lines explanation of why this prompt is powerful and effective for the target model."
            },
            proTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 bonus suggestions to customize or get even better results with this prompt."
            },
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the variation, e.g. 'Cinematic & Moody' or 'TikTok/Quick Hook' or 'Short & Punchy'." },
                  prompt: { type: Type.STRING, description: "The full alternative ready-to-use prompt for this variation." }
                },
                required: ["name", "prompt"]
              },
              description: "1-2 alternative versions with different styles, tones, or platforms."
            }
          },
          required: ["status"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response content generated by Gemini.");
    }

    const result = JSON.parse(responseText.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("Error in /api/enhance:", error);
    const errorMessage = error?.message || "";
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("credits are depleted") || errorMessage.includes("prepayment")) {
      return res.status(429).json({ 
        error: "Your Google AI Studio prepayment credits are currently exhausted. Please go to your AI Studio account (https://aistudio.google.com/) to top up your balance, or update your GEMINI_API_KEY with a funded project key.",
        isBillingError: true
      });
    }
    return res.status(500).json({ error: errorMessage || "An error occurred while enhancing your prompt." });
  }
});

// Setup Vite Dev Server / Static Content Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
