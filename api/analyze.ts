import { GoogleGenAI } from "@google/genai";
import { checkSubscriptionAccess } from '../middleware/checkSubscription';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { images, prompt, userId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        // Check subscription access
        const accessCheck = await checkSubscriptionAccess(userId, 'analyze');
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

        // Create parts for each image
        const imageParts = images.map(base64 => {
            // Remove data URL prefix if present
            const data = base64.split(',')[1] || base64;
            return {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: data
                }
            };
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt }
                ]
            }
        });

        return res.status(200).json({ text: response.text || "No analysis generated." });

    } catch (error) {
        console.error("API Analysis Error:", error);
        return res.status(500).json({ error: 'Failed to process document analysis' });
    }
}
