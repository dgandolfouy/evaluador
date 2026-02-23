import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Verificamos la API KEY
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeEvaluation = async (employee: any, criteria: any[]) => {
  try {
    // IMPORTANTE: gemini-1.5-flash es el modelo estable que soporta esquemas JSON
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING, description: "Resumen ejecutivo del desempeño." },
            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Fortalezas detectadas." },
            weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Áreas de mejora." },
            trainingPlan: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3 acciones formativas recomendadas (ISO 9001)." },
            isoComplianceLevel: { type: SchemaType.STRING, description: "Nivel (Bajo, Medio, Alto, Excelente)." },
          },
          required: ["summary", "strengths", "weaknesses", "trainingPlan", "isoComplianceLevel"],
        },
      },
    });

    const prompt = `
      Actúa como experto en ISO 9001:2015 y RRHH en la industria flexográfica (RR Etiquetas).
      Analiza el desempeño de ${employee.name} con cargo de ${employee.jobTitle}.
      
      Datos de la evaluación:
      ${criteria.map(c => `- ${c.name}: ${c.score}/10. Evidencia: ${c.feedback}`).join('\n')}

      Genera un reporte constructivo y profesional cumpliendo estrictamente con el esquema JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error en Gemini:", error);
    // Respuesta de respaldo para que la app no se cuelgue si falla la IA
    return {
      summary: "Evaluación procesada manualmente por error de conexión con el servicio de IA.",
      strengths: ["Competencia técnica en el puesto"],
      weaknesses: ["Documentación de evidencias"],
      trainingPlan: ["Revisión de procedimientos operativos"],
      isoComplianceLevel: "Pendiente de revisión"
    };
  }
};
