import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Falta la API KEY de Gemini' });
    }

    try {
        // Única URL, único modelo, sin configuraciones raras que den Error 400
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: prompt }] }] 
            })
        });

        const data = await response.json();
        
        // Si Google responde OK, mandamos la data
        if (response.ok) {
            return res.status(200).json(data);
        } else {
            // Si Google falla, imprimimos el error real en Vercel
            console.error("Error devuelto por Google:", JSON.stringify(data));
            return res.status(response.status).json(data);
        }

    } catch (error: any) {
        console.error("Error interno del servidor:", error);
        return res.status(500).json({ error: 'Network Error', details: error.message });
    }
}
