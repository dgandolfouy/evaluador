import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Solo POST');
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // Usamos v1 para que Google no te rebote el modelo flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
