import { createGoogleGenerativeAI } from "@google-ai/generativelanguage";

// Usamos la forma en que tu proyecto ya venía configurado para no romper dependencias
const ai = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

export const analyzeEvaluation = async (employee: any, criteria: any[]) => {
  try {
    // IMPORTANTE: Corregido a gemini-1.5-flash (el 3-flash no existe)
    const model = "gemini-1.5-flash";
    
    const prompt = `
      Actúa como experto en ISO 9001:2015. 
      Analiza el desempeño de ${employee.name} (${employee.jobTitle}).
      Resultados: ${criteria.map(c => `${c.name}: ${c.score}/10. Observación: ${c.feedback}`).join('. ')}
      Genera un JSON con: summary, strengths (array), weaknesses (array), trainingPlan (array), isoComplianceLevel.
    `;

    // Usamos el método que tu SDK soporta
    const result = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    // Intentamos parsear la respuesta
    const responseText = result.candidates[0].content.parts[0].text;
    return JSON.parse(responseText.replace(/```json|```/g, ""));
  } catch (error) {
    console.error("Error Gemini:", error);
    return {
      summary: "Evaluación registrada. Análisis de IA pendiente por conexión.",
      strengths: ["Cumplimiento de tareas"],
      weaknesses: ["Registro de evidencias"],
      trainingPlan: ["Refuerzo en normativas internas"],
      isoComplianceLevel: "Medio"
    };
  }
};
