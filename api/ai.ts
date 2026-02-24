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

Evaluá el desempeño del colaborador según los siguientes puntajes:

Productividad: ${productividad}/10
Calidad: ${calidad}/10
Seguridad e higiene: ${seguridad}/10
Trabajo en equipo: ${trabajoEquipo}/10

Observaciones:
${observaciones || "Sin observaciones adicionales."}

Redactá un informe profesional que incluya:

Resumen ejecutivo del desempeño general.
Fortalezas del colaborador en relación a los procesos certificados.
Debilidades o desvíos respecto a buenas prácticas ISO 9001:2015.
Recomendaciones de mejora orientadas a estandarización de procesos, control de calidad, reducción de reprocesos y mejora continua.
Conclusión general.

Usar lenguaje formal, técnico y claro.
Redactar en párrafos.
No usar emojis.
Texto apto para ser exportado a PDF.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No se pudo generar el análisis automático.";

    return Response.json({ analysis: text });

  } catch (error) {
    console.error("Error IA:", error);
    return Response.json({
      analysis:
        "No fue posible generar el análisis automático. Se recomienda realizar evaluación manual según criterios ISO 9001:2015."
    });
  }
}
