import { GEMINI_API_KEY } from "@env";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";


export async function generateResponse(prompt, timetableData = []) {
  try {
    const context = timetableData.length
      ? `Here is the timetable data: ${JSON.stringify(timetableData)}`
      : "";

    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${context}\n\nUser: ${prompt}\nAI:` }
            ]
          }
        ]
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();

    // Extract text safely
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a response.";

    return text;
  } catch (error) {
    console.error("Gemini fetch error:", error);
    return `⚠️ Error: ${error.message}`;
  }
}
