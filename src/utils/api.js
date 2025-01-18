const API_BASE_URL = 'http://localhost:5000/api';

export class ApiService {
  static getAuthToken() {
    return localStorage.getItem('token');
  }

  static async makeAuthRequest(endpoint, method = 'GET', data = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };

    const config = {
      method: method,
      headers,
      credentials: 'include',
      mode: 'cors'  // Add CORS mode
    };

    if (method === 'DELETE') {
      delete config.headers['Content-Type'];
      delete config.body;
    }

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Log the response details for debugging
      console.log('API Response:', {
        endpoint,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response Data:', responseData);
      return responseData;
    } catch (error) {
      console.error('API Error:', {
        endpoint,
        error: error.message,
        details: error
      });
      throw error;
    }
  }

  static async makeRequest(prompt, maxTokens = 1000) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      // First, deduct a token
      await this.makeAuthRequest('/users/tokens', 'POST', {
        amount: -1,
        action: 'API_REQUEST'
      });

      // Then make the AI API call
      const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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

      if (!aiResponse.ok) {
        throw new Error('AI API request failed');
      }

      const data = await aiResponse.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('API Request Error:', {
        error: error.message,
        details: error
      });
      throw error;
    }
  }

  static parseJsonResponse(content) {
    try {
      if (typeof content === 'object') {
        return content;
      }
      // Try to parse as pure JSON first
      return JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from the string
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse JSON response');
    }
  }
}

export default ApiService;
