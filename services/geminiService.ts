
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// The API key is assumed to be available from the environment.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.warn("API_KEY environment variable not found. AI features will not work.");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });

/**
 * Generates a response from the AI model using a streaming SDK call.
 * @param prompt The text prompt to send to the model.
 * @param imageBase64 Optional base64 encoded image data.
 * @param onChunk A callback function that receives text chunks as they are generated.
 * @param options Optional configuration for the generation request, including model name.
 */
export const generateResponseStream = async (
    prompt: string, 
    imageBase64: string | null,
    onChunk: (chunk: string) => void,
    options?: { model?: string, config?: any }
): Promise<void> => {
    if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
    }
    const modelName = options?.model || 'gemini-3-pro-preview';

    const contentParts: any[] = [];

    if (prompt) {
        contentParts.push({ text: prompt });
    }

    if (imageBase64) {
        try {
            const [header, data] = imageBase64.split(",", 2);
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (!mimeType || !data) throw new Error("Invalid image format.");
            contentParts.push({
                inlineData: {
                    mimeType,
                    data,
                },
            });
        } catch(e) {
            console.error("Error processing image data:", e);
            throw new Error("Could not process the uploaded image.");
        }
    }
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: { parts: contentParts },
            config: options?.config,
        });

        for await (const chunk of responseStream) {
            const chunkResponse = chunk as GenerateContentResponse;
            if (chunkResponse.text) {
                onChunk(chunkResponse.text);
            }
        }
    } catch (error) {
        console.error("Error in generateResponseStream:", error);
        throw error;
    }
};

/**
 * Generates a short title for a chat message.
 * @param message The initial message of the chat.
 */
export const generateChatTitle = async (message: string): Promise<string> => {
    if (!apiKey) {
         console.error("Gemini API key is not configured.");
         return "";
    }
    try {
        const prompt = `Generate a very short (3-5 words) and descriptive title for a chat that starts with: "${message}". Return ONLY the title text, no quotes or labels.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text?.trim().replace(/"/g, '') || "";
    } catch (error) {
        console.error("Error generating chat title:", error);
        return "";
    }
};

/**
 * Generates an image based on a prompt.
 * @param prompt The text prompt for the image.
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
    if (!apiKey) {
        console.error("Gemini API key is not configured.");
        return null;
    }
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `Generate a realistic image of: ${prompt}` }] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
                return imageUrl;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};