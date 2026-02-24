import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, type } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({
            error: 'GEMINI_API_KEY no configurada en el servidor',
            hint: 'Asegúrese de agregar GEMINI_API_KEY en las variables de entorno de Vercel.'
        });
    }

    // Volvemos a v1beta donde gemini-1.5-flash es detectado correctamente
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: type === 'criteria' ? 0.2 : 0.4
                    // OMITIMOS responseMimeType para evitar el error "Unknown name" en el payload
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Backend Fail:", JSON.stringify(data));
            return res.status(response.status).json({
                error: 'Error de la API de Gemini',
                details: data.error?.message || 'Error desconocido del servidor de Google'
            });
        }

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return res.status(500).json({ error: 'La IA devolvió una respuesta vacía.' });
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error("Critical Bridge Error:", error.message);
        return res.status(500).json({
            error: 'Fallo interno en el puente de IA',
            details: error.message
        });
    }
}
