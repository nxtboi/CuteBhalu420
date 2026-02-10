import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Use a variable to cache the initialized client.
let aiInstance: GoogleGenAI | null = null;

// Lazily initialize and cache the AI client.
// This ensures `process.env.API_KEY` is read at the time of the first API call,
// resolving potential timing issues, and prevents re-creating the client on every subsequent call.
export const getAiClient = () => {
    if (aiInstance) {
        return aiInstance;
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
    }
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
    return aiInstance;
};

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const generateResponse = async (prompt: string, imageBase64: string | null): Promise<string> => {
  try {
    // Get the client instance just before making the call.
    const ai = getAiClient();
    const model = 'gemini-3-flash-preview';

    if (imageBase64) {
      const imageMimeType = imageBase64.substring(5, imageBase64.indexOf(';'));
      const imageData = imageBase64.split(',')[1];
      const imagePart = fileToGenerativePart(imageData, imageMimeType);
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }, imagePart] },
      });
      return response.text ?? "Sorry, I couldn't process that request.";

    } else {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text ?? "Sorry, I couldn't process that request.";
    }
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    throw new Error("Failed to communicate with the AI model. Please check your network connection and API key.");
  }
};

/**
 * Generates a response from the AI model using streaming.
 * @param prompt The text prompt to send to the model.
 * @param imageBase64 Optional base64 encoded image data.
 * @param onChunk A callback function that receives text chunks as they are generated.
 * @param config Optional configuration for the generation request.
 */
export const generateResponseStream = async (
    prompt: string, 
    imageBase64: string | null,
    onChunk: (chunk: string) => void,
    config?: any
): Promise<void> => {
    try {
        const ai = getAiClient();
        const model = 'gemini-3-flash-preview';

        const contents = imageBase64 
            ? { parts: [
                { text: prompt }, 
                fileToGenerativePart(imageBase64.split(',')[1], imageBase64.substring(5, imageBase64.indexOf(';')))
              ]}
            : prompt;

        const responseStream = await ai.models.generateContentStream({
            model,
            contents,
            config,
        });

        for await (const chunk of responseStream) {
            const responseChunk = chunk as GenerateContentResponse;
            if (responseChunk.text) {
                onChunk(responseChunk.text);
            }
        }
    } catch (error) {
        console.error("Error generating streaming response from Gemini:", error);
        throw new Error("Failed to communicate with the AI model. Please check your network connection and API key.");
    }
};


interface PlaygroundConfig {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    topK?: number;
    topP?: number;
}

export const generatePlaygroundResponse = async (config: PlaygroundConfig): Promise<string> => {
    try {
        const ai = getAiClient();
        const model = 'gemini-3-flash-preview'; 

        const response = await ai.models.generateContent({
            model,
            contents: config.prompt,
            config: {
                systemInstruction: config.systemInstruction,
                temperature: config.temperature,
                topK: config.topK,
                topP: config.topP,
            },
        });

        return response.text ?? "Sorry, the model did not return a response.";

    } catch (error) {
        console.error("Error in playground generation:", error);
        throw new Error("Failed to get response from AI model. Please check your configuration and API key.");
    }
};

export const generateCodeEditResponse = async (fullPrompt: string): Promise<string> => {
    try {
        const ai = getAiClient();
        // Use a more powerful model for complex code generation tasks.
        const model = 'gemini-3-pro-preview'; 

        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
        });

        return response.text ?? "Sorry, the model did not return a valid response.";
    } catch (error) {
        console.error("Error in code edit generation:", error);
        throw new Error("Failed to get response from AI model. Please check your configuration, API key, and the prompt length.");
    }
};

export const generateChatTitle = async (message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const model = 'gemini-3-flash-preview';
        const response = await ai.models.generateContent({
            model,
            contents: `Generate a very short (3-5 words) and descriptive title for a chat that starts with: "${message}". Return ONLY the title text, no quotes or labels.`,
        });
        return response.text?.trim().replace(/^"|"$/g, '') || "";
    } catch (error) {
        console.error("Error generating chat title:", error);
        return "";
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
      model,
      contents: {
          parts: [{ text: `Generate a realistic image of: ${prompt}` }]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error: any) {
    // Check for 429 specifically to avoid spamming the console with "Errors" when it's just a limit
    if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
        console.warn("Gemini Image Generation Quota Exceeded. Returning null to trigger fallback.");
    } else {
        console.error("Error generating image:", error);
    }
    return null;
  }
};