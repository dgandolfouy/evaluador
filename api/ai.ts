export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      productividad,
      calidad,
      seguridad,
      trabajoEquipo,
      observaciones
    } = body;

    const prompt = `
Actuás como auditor profesional de sistemas de gestión de calidad ISO 9001:2015,
especializado en industria gráfica y procesos de impresión flexográfica.

La empresa tiene certificados sus procesos productivos.

Productividad: ${productividad}/10
Calidad: ${calidad}/10
Seguridad e higiene: ${seguridad}/10
Trabajo en equipo: ${trabajoEquipo}/10

Observaciones:
${observaciones || "Sin observaciones adicionales."}

Redactá un informe profesional con:
Resumen ejecutivo.
Fortalezas.
Debilidades.
Recomendaciones.
Conclusión.

Lenguaje técnico, formal, en párrafos, sin emojis.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    console.log("RESPUESTA IA:", JSON.stringify(data));

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No se pudo generar análisis.";

    return Response.json({ analysis: text });

  } catch (error) {
    console.error("Error IA:", error);
    return Response.json({
      analysis: "Error generando análisis automático."
    });
  }
}
