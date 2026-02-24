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

    // Intento 1: v1 (Estable) + 1.5 Flash
    let res1 = await tryGemini('v1', 'gemini-1.5-flash', prompt, GEMINI_API_KEY);
    if (res1.ok) return res.status(200).json(res1.data);

    // Intento 2: v1beta + 1.5 Flash
    console.warn("Attempt 1 failed, trying v1beta...");
    let res2 = await tryGemini('v1beta', 'gemini-1.5-flash', prompt, GEMINI_API_KEY);
    if (res2.ok) return res.status(200).json(res2.data);

    // Intento 3: v1 + 1.0 Pro (Universal)
    console.warn("Attempt 2 failed, trying 1.0 Pro...");
    let res3 = await tryGemini('v1', 'gemini-pro', prompt, GEMINI_API_KEY);
    if (res3.ok) return res.status(200).json(res3.data);

    return res.status(res3.status).json({
        error: 'IA Offline',
        details: res3.data?.error?.message || "No se pudo conectar con ningún modelo de Gemini."
    });
}
