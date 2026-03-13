class AzureAIService {
  constructor() {
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview';
  }

  async generateChatCompletion(messages, options = {}) {
    try {
      const endpoint = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
      const url = `${endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
      
      console.log(`[AI Service] Attempting request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          max_tokens: options.maxTokens || 800,
          temperature: options.temperature || 0.7,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Azure OpenAI request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Azure OpenAI Error:', error.message);
      throw new Error(`Failed to generate AI completion: ${error.message}`);
    }
  }

  async analyzeOutbreak(outbreakData) {
    const messages = [
      {
        role: "system",
        content: "You are an expert epidemiological analyst for WHO AFRO. Analyze the provided outbreak data and recommend essential health commodities."
      },
      {
        role: "user",
        content: `Analyze this outbreak data: ${JSON.stringify(outbreakData)}`
      }
    ];

    return this.generateChatCompletion(messages);
  }
}

module.exports = new AzureAIService();
