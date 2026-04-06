import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeAndOrganizeEventData = async (currentData: any, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `You are an expert event organizer AI for World Creativity Day 2026 Itajaí.
      Your task is to analyze the current event data and the user's request, and suggest updates to the schedule, volunteer assignments, or activities.
      
      Current Data:
      ${JSON.stringify(currentData, null, 2)}
      
      User Request:
      ${prompt}
      
      Respond with a JSON object containing the suggested updates for activities and assignments.
      Format:
      {
        "activitiesToUpdate": [{ "id": "...", "updates": { ... } }],
        "activitiesToAdd": [{ "title": "...", "description": "...", "startTime": "...", "endTime": "...", "type": "...", "location": "...", "dayId": "..." }],
        "assignmentsToUpdate": [{ "id": "...", "updates": { ... } }],
        "assignmentsToAdd": [{ "activityId": "...", "userId": "...", "role": "..." }],
        "explanation": "A brief explanation of the changes made."
      }
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateOD = async (dayData: any, weatherInfo: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate an "Ordem do Dia" (O.D.) for World Creativity Day 2026 Itajaí.
      
      Day Data:
      ${JSON.stringify(dayData, null, 2)}
      
      Weather Info:
      ${weatherInfo}
      
      Include:
      1. A summary of the day.
      2. The detailed schedule. **CRITICAL: This MUST be presented as a highly organized, strategic, and optimized Markdown table with EXACTLY these columns: "Dia", "Horário", "Local endereço", "Local (sala, etc)", "Setor/Nicho", "Inspirador", "Nome da atividade do inspirador", "Nome do voluntário", "Função do voluntário".** 
         - Distribute the data intelligently across these columns. 
         - Use the activity 'type' for "Setor/Nicho".
         - Extract the speaker/leader from the 'description' or assignments for "Inspirador" (formerly Líder).
         - Use the activity 'title' for "Nome da atividade do inspirador".
         - List the assigned support volunteers in "Nome do voluntário".
         - List the role of the volunteer in "Função do voluntário".
         - "Local endereço" should be the main building/address (e.g., Unisul, Casa de Cultura).
         - "Local (sala, etc)" should be the specific room.
      3. The weather forecast.
      4. A summarized important fact about World Creative Day with an inspiring phrase.
      5. A Google Maps link to the location: ${dayData.day?.location || 'Itajaí'}.
      
      Format the output in Markdown. Make it look professional and clean.
      `
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are a helpful assistant for the organizers of World Creativity Day 2026 Itajaí. You help them manage schedules, volunteers, and activities. Be concise, friendly, and inspiring."
    }
  });
};
