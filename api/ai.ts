import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { prompt } = req.body;
  // Intenta leer la clave de ambas formas posibles
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("ERROR CRÍTICO: No se encontró GEMINI_API_KEY en las variables de entorno de Vercel.");
    return res.status(500).json({ error: 'Falta API Key en el servidor.' });
  }

  try {
    // Usamos la URL v1 que es la más estable para el modelo flash
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
      console.error("Google respondió con error:", JSON.stringify(data));
      return res.status(response.status).json(data);
    }
  } catch (error: any) {
    console.error("Error de conexión:", error.message);
    return res.status(500).json({ error: 'Error de red', details: error.message });
  }
}
