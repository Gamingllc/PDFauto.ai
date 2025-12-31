import { GoogleGenAI } from "@google/genai";
import { checkSubscriptionAccess } from '../middleware/checkSubscription';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, userId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        // Check subscription access
        const accessCheck = await checkSubscriptionAccess(userId, 'refine');
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

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Reformat the following text into a clean, professional markdown document suitable for a PDF report. Organize into logical sections:\n\n${text}`
        });

        return res.status(200).json({ text: response.text || text });

    } catch (error) {
        console.error("API Refine Error:", error);
        return res.status(500).json({ error: 'Failed to process text refinement' });
    }
}
