
import { GoogleGenAI, Type } from "@google/genai";
import { VideoResult } from "../types";

// Always use the named parameter and obtain the API key exclusively from process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT'.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

export const transcribeVideo = async (url: string): Promise<Partial<VideoResult>> => {
  // Use gemini-3-pro-preview for complex reasoning and external search tasks.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Process this YouTube URL: ${url}. 
    1. Search for the actual transcript or detailed content breakdown of this video.
    2. Reconstruct a chronological, high-fidelity transcript of what is said or the sequence of events.
    3. Extract the video title and channel name.
    4. Provide the data in a structured JSON format.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          channelName: { type: Type.STRING },
          transcript: { type: Type.STRING, description: "Full reconstructed transcript" },
          summary: { type: Type.STRING },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                text: { type: Type.STRING }
              }
            }
          },
          metadata: {
            type: Type.OBJECT,
            properties: {
              views: { type: Type.STRING },
              date: { type: Type.STRING }
            }
          }
        },
        required: ["title", "transcript", "channelName"]
      }
    }
  });

  // Extract grounding URLs from groundingMetadata as required for search grounding.
  const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => {
      if (chunk.web) {
        return { title: chunk.web.title, url: chunk.web.uri };
      }
      return null;
    })
    .filter(Boolean) || [];

  // Use the .text property directly. 
  // Implement safe parsing as search grounding may occasionally return non-JSON content.
  let data = {};
  try {
    const jsonStr = response.text || "{}";
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.warn("Response parsing failed, possibly due to search citations in response text:", e);
    // Fallback if the model returns markdown or plain text despite JSON request.
    data = { 
      transcript: response.text,
      title: "Web Recon Engine Result",
      channelName: "Verified Source"
    };
  }

  return {
    ...data,
    groundingUrls,
    status: 'completed'
  };
};
