import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({
            error: 'GEMINI_API_KEY no configurada',
            details: 'Debe configurar GEMINI_API_KEY en Vercel -> Settings -> Environment Variables.'
        });
    }

    // Usamos v1 Estable y simplificamos la URL al máximo
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
                // Eliminamos generationConfig por completo para evitar errores de esquema en v1
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data.error?.message || "Unknown error");
            return res.status(response.status).json({
                error: 'Error de comunicación con Google',
                details: data.error?.message || 'Error desconocido del servidor'
            });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return res.status(500).json({ error: 'La IA no devolvió texto.' });
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Backend Bridge Failure:", error.message);
        return res.status(500).json({
            error: 'Fallo interno en el puente de IA',
            details: error.message
        });
    }
}
