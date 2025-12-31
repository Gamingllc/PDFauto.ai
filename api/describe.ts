import { GoogleGenAI } from "@google/genai";
import { checkSubscriptionAccess } from '../middleware/checkSubscription';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, prompt, userId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        // Check subscription access
        const accessCheck = await checkSubscriptionAccess(userId, 'describe');
        if (!accessCheck.allowed) {
            return res.status(403).json({
                error: accessCheck.reason || 'Access denied',
                requiresUpgrade: true
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: API Key missing' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const base64Data = image.split(',')[1] || image;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data
                        }
                    },
                    { text: prompt || "Describe this image in detail for a document caption." }
                ]
            }
        });

        return res.status(200).json({ text: response.text || "No description generated." });

    } catch (error) {
        console.error("API Describe Error:", error);
        return res.status(500).json({ error: 'Failed to process image description' });
    }
}
