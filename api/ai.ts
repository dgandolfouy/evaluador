import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro"
    });

    const prompt = `
Actuás como auditor profesional de sistemas de gestión de calidad ISO 9001:2015,
especializado en industria gráfica y procesos de impresión flexográfica.

La empresa tiene certificados sus procesos productivos.

Evaluá el desempeño del colaborador en función de estos puntajes:

- Productividad: ${productividad}/10
- Calidad: ${calidad}/10
- Seguridad e higiene: ${seguridad}/10
- Trabajo en equipo: ${trabajoEquipo}/10

Observaciones adicionales:
${observaciones || "Sin observaciones adicionales."}

Redactá un informe profesional para un reporte interno que incluya:

1. Resumen ejecutivo del desempeño general.
2. Fortalezas del colaborador en relación a los procesos certificados.
3. Debilidades o desvíos respecto a buenas prácticas ISO 9001:2015.
4. Recomendaciones de mejora orientadas a:
   - estandarización de procesos
   - control de calidad
   - reducción de reprocesos
   - mejora continua
5. Conclusión general.

Usar lenguaje formal, técnico y claro.
No usar emojis.
No usar listas con viñetas.
Redactar en párrafos.
Texto apto para ser exportado a PDF.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ analysis: text });

  } catch (error) {
    console.error("Error IA:", error);

    return Response.json({
      analysis: `No fue posible generar el análisis automático. 
Se recomienda realizar evaluación manual según criterios ISO 9001:2015.`
    });
  }
}
