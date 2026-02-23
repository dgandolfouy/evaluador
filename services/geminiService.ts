import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeEvaluation = async (employee: any, criteria: any[]) => {
  try {
    // Usamos 1.5-flash que es rápido y soporta esquemas
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING, description: "Resumen ejecutivo del desempeño." },
            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Lista de fortalezas detectadas." },
            weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Áreas de oportunidad." },
            trainingPlan: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3 acciones formativas recomendadas (ISO 9001)." },
            isoComplianceLevel: { type: SchemaType.STRING, description: "Nivel de cumplimiento (Bajo, Medio, Alto, Excelente)." },
          },
          required: ["summary", "strengths", "weaknesses", "trainingPlan", "isoComplianceLevel"],
        },
      },
    });

    const prompt = `
      Actúa como un experto en Gestión de Calidad ISO 9001:2015 y RRHH en la industria flexográfica.
      Analiza el desempeño de ${employee.name} con cargo de ${employee.jobTitle}.
      
      Datos de la evaluación:
      ${criteria.map(c => `- ${c.name}: ${c.score}/10. Evidencia: ${c.feedback}`).join('\n')}

      Genera un reporte constructivo y profesional.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error en Gemini:", error);
    return {
      summary: "Análisis generado automáticamente debido a un error de conexión con la IA.",
      strengths: ["Competencia técnica demostrada"],
      weaknesses: ["Documentación de procesos"],
      trainingPlan: ["Revisión de procedimientos internos"],
      isoComplianceLevel: "Pendiente de revisión"
    };
  }
};
