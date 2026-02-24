import { VercelRequest, VercelResponse } from '@vercel/node';

async function tryModel(model: string, prompt: string, apiKey: string) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });

    // Intento 1: Gemini 1.5 Flash (El estándar)
    let result = await tryModel('gemini-1.5-flash', prompt, GEMINI_API_KEY);

    // Intento 2: Si falla con 404, probar gemini-1.0-pro (El universal)
    if (!result.ok && result.status === 404) {
        console.warn("Retrying with gemini-1.0-pro...");
        result = await tryModel('gemini-1.0-pro', prompt, GEMINI_API_KEY);
    }

    if (!result.ok) {
        return res.status(result.status).json({
            error: 'Error de la API de Google',
            details: result.data.error?.message || 'Error desconocido'
        });
    }

    return res.status(200).json(result.data);
}
