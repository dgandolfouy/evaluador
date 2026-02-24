import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Falta la API KEY de Gemini' });

  try {
    // Usamos v1 que es la más compatible con el modelo flash actual
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }] 
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      // Si falla, devolvemos el error real de Google para verlo en los logs
      return res.status(response.status).json(data);
    }

  } catch (error: any) {
    return res.status(500).json({ error: 'Error de red', details: error.message });
  }
}
