export const analyzeEvaluation = async (employee: any, criteria: any[]) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  // Usamos el modelo 1.5-flash que es el estándar actual
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const prompt = `
      Actúa como experto en ISO 9001:2015 y RRHH en la industria flexográfica (RR Etiquetas).
      Analiza el desempeño de ${employee.name} con cargo de ${employee.jobTitle}.
      
      Datos de la evaluación:
      ${criteria.map(c => `- ${c.name}: ${c.score}/10. Evidencia: ${c.feedback}`).join('\n')}

      Genera un reporte constructivo y profesional.
      Responde ÚNICAMENTE en formato JSON con esta estructura exacta:
      {
        "summary": "Resumen ejecutivo",
        "strengths": ["fortaleza1", "fortaleza2"],
        "weaknesses": ["mejora1", "mejora2"],
        "trainingPlan": ["accion1", "accion2", "accion3"],
        "isoComplianceLevel": "Bajo/Medio/Alto/Excelente"
      }
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) throw new Error("No hay respuesta de IA");
    
    const responseText = data.candidates[0].content.parts[0].text;
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Error en Gemini:", error);
    return {
      summary: "Análisis manual requerido por error de conexión con el servicio de IA.",
      strengths: ["Competencia técnica demostrada"],
      weaknesses: ["Documentación de procesos"],
      trainingPlan: ["Revisión de procedimientos operativos"],
      isoComplianceLevel: "Pendiente"
    };
  }
};
