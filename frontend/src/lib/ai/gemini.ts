import { GoogleGenAI, Type } from '@google/genai';
import { healthService } from '../api/services/health.service';
import type { ChatMessage } from '../api/types';

export async function fetchHealthContext(userId: string) {
  // Fetch last 14 days of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14);

  const start_date = startDate.toISOString();
  const end_date = endDate.toISOString();

  try {
    const [workoutsRes, sleepRes, activityRes, bodyRes] = await Promise.all([
      healthService.getWorkouts(userId, { start_datetime: start_date, end_datetime: end_date, limit: 100 }),
      healthService.getSleepSummaries(userId, { start_date, end_date, limit: 14 }),
      healthService.getActivitySummaries(userId, { start_date, end_date, limit: 14 }),
      healthService.getBodySummary(userId)
    ]);

    return {
      workouts: workoutsRes?.data || [],
      sleep: sleepRes?.data || [],
      activity: activityRes?.data || [],
      body: bodyRes || null
    };
  } catch (error) {
    console.error('Failed to fetch health context:', error);
    // Return empty context if fetch fails
    return { workouts: [], sleep: [], activity: [], body: null };
  }
}

export function buildSystemPrompt(healthData: any): string {
  return `You are an elite sports science and recovery coach. You have access to the user's real physiological data from their wearable devices. Analyze patterns, provide actionable recovery insights, and answer their questions.

=== USER HEALTH DATA (Last 14 Days) ===
${JSON.stringify(healthData, null, 2)}

Guidelines:
- Reference specific data points in your analysis
- Provide actionable, evidence-based recommendations
- Flag concerning trends (poor sleep, overtraining signs)
- Use a supportive, coaching tone
- Format your response using markdown. Use bolding for emphasis and bullet points for readability.
- If the user asks for deep Strava analysis (e.g. segment analysis, power data), use the 'analyze_strava_data' tool to fetch it from the Strava MCP.`;
}

const mcpTools = [{
  functionDeclarations: [
    {
      name: 'analyze_strava_data',
      description: 'Fetch and analyze detailed data (e.g., segments, power streams) from the Strava MCP server.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: 'What to query from the Strava MCP (e.g. "latest ride power data")' },
        },
        required: ['query'],
      },
    },
  ],
}];

async function callBackendMcpProxy(toolName: string, args: any) {
  try {
    const response = await fetch('/api/v1/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_name: toolName, arguments: args })
    });
    return await response.json();
  } catch (error) {
    console.error('MCP proxy call failed:', error);
    return { error: 'Failed to connect to backend MCP proxy' };
  }
}

export async function streamGeminiResponse(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  onChunk: (chunkText: string) => void
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  
  // Format history for Gemini API
  let formattedContents: any[] = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    let responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        tools: mcpTools,
      }
    });

    let fullResponse = '';
    let functionCalls: any[] = [];
    
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullResponse += chunk.text;
        onChunk(chunk.text);
      }
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        functionCalls.push(...chunk.functionCalls);
      }
    }

    // If Gemini decided to call a tool, we execute it and send the result back
    if (functionCalls.length > 0) {
      onChunk("\n\n*Fetching data from Strava MCP...*\n");
      const call = functionCalls[0];
      const toolResult = await callBackendMcpProxy(call.name, call.args);
      
      // Append the model's function call to history
      formattedContents.push({
        role: 'model',
        parts: [{ functionCall: call }]
      });
      
      // Append the function response
      formattedContents.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: call.name,
            response: toolResult
          }
        }]
      });

      // Call Gemini again to get the final analysis
      const followupStream = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents: formattedContents,
        config: { systemInstruction: systemPrompt }
      });

      for await (const chunk of followupStream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          onChunk(chunk.text);
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
