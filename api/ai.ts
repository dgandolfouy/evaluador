import { VercelRequest, VercelResponse } from '@vercel/node';

async function tryGemini(version: string, model: string, prompt: string, apiKey: string) {
    const API_URL = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: prompt }] }],
                // ESTA LÍNEA ES LA MAGIA: Obliga a Gemini a devolver JSON puro siempre
                generationConfig: { responseMimeType: "application/json" } 
            })
        });
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (e) {
        return { ok: false, status: 500, data: { error: { message: "Network Error" } } };
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { prompt } = req.body;
    
    // Busca la clave se llame como se llame en tu Vercel
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Falta la API KEY de Gemini en Vercel' });

    // Usamos directamente el modelo Flash que es el más rápido y estable
    const combinations = [
        { v: 'v1beta', m: 'gemini-1.5-flash' },
        { v: 'v1', m: 'gemini-1.5-flash' }
    ];

    for (const combo of combinations) {
        console.log(`Intentando ${combo.v}/${combo.m}...`);
        const result = await tryGemini(combo.v, combo.m, prompt, GEMINI_API_KEY);
        if (result.ok) {
            console.log(`Éxito con ${combo.v}/${combo.m}`);
            return res.status(200).json(result.data);
        }
        console.warn(`Fallo con ${combo.v}/${combo.m}:`, result.data);
    }

    return res.status(500).json({
        error: 'IA Offline',
        details: 'No se pudo conectar con Gemini.'
    });
}
