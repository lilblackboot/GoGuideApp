import { GEMINI_API_KEY } from "@env";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function generateResponse(prompt, timetableData = []) {
  try {
    // Create structured context with clear instructions
    const systemPrompt = `You are a helpful personal assistant designed to help users with their timetable and schedule queries. 

IMPORTANT GUIDELINES:
- If asked about your identity, respond as "I'm your personal assistant" or "I'm here to help you with your schedule"
- NEVER reveal that you are an AI, LLM, or mention Google/Gemini
- When using timetable data, only provide information that directly answers the user's question
- NEVER dump the entire dataset or JSON structure in your response
- Keep responses concise and user-friendly
- If no relevant timetable data exists for a query, politely say so
- Format responses in a natural, conversational way
- Only reference specific schedule items when directly asked about them`;

    const context = timetableData.length 
      ? `Available timetable information: ${JSON.stringify(timetableData)}\n\n` 
      : "";

    const fullPrompt = `${systemPrompt}\n\n${context}User Question: ${prompt}\n\nPlease provide a helpful response:`;

    const requestBody = {
      contents: [{
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        stopSequences: ["User:", "AI:", "Assistant:"]
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API Error ${response.status}: ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Enhanced response extraction with validation
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.warn('No text content in API response:', data);
      return "I'm sorry, I couldn't generate a proper response. Please try again.";
    }

    // Post-process the response to ensure quality
    const cleanedResponse = cleanResponse(text);
    
    return cleanedResponse;

  } catch (error) {
    console.error("Chatbot error:", error);
    
    // More user-friendly error messages
    if (error.message.includes('API_KEY')) {
      return "I'm having trouble connecting right now. Please check the API configuration.";
    } else if (error.message.includes('quota')) {
      return "I'm temporarily unavailable due to high usage. Please try again later.";
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      return "I'm having connection issues. Please check your internet and try again.";
    }
    
    return "I encountered an issue while processing your request. Please try again.";
  }
}

// Helper function to clean and validate the response
function cleanResponse(text) {
  // Remove any JSON dumps or raw data
  if (text.includes('```json') || text.includes('{"') || text.includes('[{')) {
    // If the response contains JSON, extract only the conversational part
    const lines = text.split('\n');
    const cleanLines = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('{') && 
             !trimmed.startsWith('[') && 
             !trimmed.startsWith('}') && 
             !trimmed.startsWith(']') &&
             !trimmed.includes('```');
    });
    text = cleanLines.join('\n').trim();
  }

  // Remove any mentions of AI/LLM identity
  text = text.replace(/I am (an AI|a language model|an LLM|Google's|Gemini)/gi, "I'm your personal assistant");
  text = text.replace(/As (an AI|a language model|an LLM)/gi, "As your assistant");
  
  // Ensure the response isn't empty after cleaning
  if (!text.trim()) {
    return "I'm here to help! Could you please rephrase your question?";
  }

  return text.trim();
}

// Optional: Add a function to validate timetable data structure
export function validateTimetableData(data) {
  if (!Array.isArray(data)) return false;
  
  return data.every(item => 
    item && 
    typeof item === 'object' && 
    (item.time || item.subject || item.activity || item.title)
  );
}