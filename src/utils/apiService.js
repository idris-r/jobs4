import { API_ENDPOINTS } from './constants';

export class ApiService {
  static async makeRequest(prompt, maxTokens = 1000) {
    const response = await fetch(API_ENDPOINTS.DEEPSEEK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    return data.choices[0].message.content;
  }

  static parseJsonResponse(content) {
    return JSON.parse(content.replace(/```json|```/g, '').trim());
  }
}
