import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Falta la API KEY de Gemini' });

    try {
        // Intento 1: El modelo más rápido (Flash)
        const urlFlash = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const resFlash = await fetch(urlFlash, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const dataFlash = await resFlash.json();
        
        if (resFlash.ok) {
            return res.status(200).json(dataFlash);
        } 

        // Intento 2: Si Flash da Error 404 (pasa con algunas cuentas), usamos Pro
        console.warn("Flash falló, intentando con Pro de respaldo...");
        const urlPro = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;
        const resPro = await fetch(urlPro, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const dataPro = await resPro.json();
        return res.status(resPro.ok ? 200 : 500).json(dataPro);

    } catch (e: any) {
        return res.status(500).json({ error: 'Network Error', details: e.message });
    }
}
