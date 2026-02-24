import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, type } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error("Backend Error: GEMINI_API_KEY is missing in environment variables.");
        return res.status(500).json({
            error: 'GEMINI_API_KEY no configurada en el servidor',
            hint: 'Asegúrese de agregar GEMINI_API_KEY en las variables de entorno de Vercel.'
        });
    }

    const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

    try {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: type === 'criteria' ? 0.2 : 0.4
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API returned error:", JSON.stringify(data));
            return res.status(response.status).json({
                error: 'Error de la API de Gemini',
                details: data.error?.message || 'Error desconocido'
            });
        }

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error("Gemini API returned empty candidates:", JSON.stringify(data));
            return res.status(500).json({ error: 'Gemini no devolvió ninguna respuesta válida' });
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Backend AI Exception:", error.message);
        return res.status(500).json({
            error: 'Fallo interno en el puente de IA',
            details: error.message
        });
    }
}
