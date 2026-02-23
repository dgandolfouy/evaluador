export const analyzeEvaluation = async (employee: any, criteria: any[]) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const prompt = `
      Actúa como experto en ISO 9001:2015. 
      Analiza el desempeño de ${employee.name} (${employee.jobTitle}).
      Resultados: ${criteria.map(c => `${c.name}: ${c.score}/10. Observación: ${c.feedback}`).join('. ')}
      Devuelve ÚNICAMENTE un objeto JSON con: summary, strengths (array), weaknesses (array), trainingPlan (array), isoComplianceLevel.
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Limpiamos posibles etiquetas de Markdown si la IA las pone
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Error Gemini:", error);
    return {
      summary: "Evaluación registrada. Análisis de IA pendiente por conexión.",
      strengths: ["Competencia técnica"],
      weaknesses: ["Registro de evidencias"],
      trainingPlan: ["Capacitación en procesos"],
      isoComplianceLevel: "Medio"
    };
  }
};
