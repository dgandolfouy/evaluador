import { VercelRequest, VercelResponse } from '@vercel/node';

async function tryGemini(version: string, model: string, prompt: string, apiKey: string) {
    const API_URL = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY missing' });

    // Los identificadores correctos para Gemini son gemini-1.5-flash y gemini-1.0-pro
    const combinations = [
        { v: 'v1beta', m: 'gemini-1.5-flash' },
        { v: 'v1', m: 'gemini-1.5-flash' },
        { v: 'v1beta', m: 'gemini-1.0-pro' },
        { v: 'v1', m: 'gemini-1.0-pro' }
    ];

    for (const combo of combinations) {
        console.log(`Trying ${combo.v}/${combo.m}...`);
        const result = await tryGemini(combo.v, combo.m, prompt, GEMINI_API_KEY);
        if (result.ok) {
            console.log(`Success with ${combo.v}/${combo.m}`);
            return res.status(200).json(result.data);
        }
        console.warn(`${combo.v}/${combo.m} failed: ${result.data?.error?.message}`);
    }

    return res.status(500).json({
        error: 'IA Offline',
        details: 'No se pudo conectar con ningún modelo de Gemini (Flash ni Pro). Verifica tu cuota o clave API en Vercel.'
    });
}
