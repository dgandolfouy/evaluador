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
            details: 'Configura la variable en Vercel -> Settings.'
        });
    }

    // Usamos v1beta con el sufijo -latest para máxima compatibilidad
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7, // Subimos un poco para evitar respuestas vacías en v1beta
                    topP: 0.95,
                    topK: 64,
                    maxOutputTokens: 2048,
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Bridge Fault:", JSON.stringify(data.error));
            return res.status(response.status).json({
                error: 'Error de la API de Google',
                details: data.error?.message || 'Error desconocido'
            });
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Bridge Connection Error:", error.message);
        return res.status(500).json({
            error: 'Fallo crítico de conexión',
            details: error.message
        });
    }
}
