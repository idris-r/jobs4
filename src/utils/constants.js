export const API_ENDPOINTS = {
  DEEPSEEK: 'https://api.deepseek.com/v1/chat/completions'
};

export const SECTIONS = {
  INPUT: 'input',
  ANALYSIS: 'analysis',
  ACTIONABLE: 'actionableItems',
  OPTIMIZE: 'optimizeCV',
  COVER: 'coverLetter'
};

export const PROMPTS = {
  ANALYZE: (cv, job) => `
    Analyze this CV and Job Description:
    CV: ${cv}
    Job Description: ${job}
    Provide: 1. A suitability score (0-100) 2. A concise analysis (max 150 words, second person)
    Format response as JSON: { "score": number, "justification": string }`,
  
  ACTIONS: (cv, job) => `
    Based on this CV and Job Description:
    CV: ${cv}
    Job Description: ${job}
    Provide: 1. Specific areas to improve 2. Actionable steps (max 150 words)
    Format as a list without bullet points`,
  
  OPTIMIZE: (cv, job) => `
    Analyze this CV against the specific job description and identify 3-5 points that could be better aligned with the job requirements.
    
    CV: ${cv}
    Job Description: ${job}

    Instructions:
    1. First, extract key requirements and skills from the job description
    2. For each identified point in the CV:
       - Find specific text that could better match the job requirements
       - Provide an improved version that:
         * Incorporates relevant keywords from the job description
         * Emphasizes experiences that directly match job requirements
         * Quantifies achievements where possible
         * Uses terminology aligned with the job posting
         * Maintains similar length to original
       - Explain specifically how this improvement matches job requirements
       - Rate the impact based on relevance to key job requirements
    3. Focus on:
       * Skills mentioned in job description but understated in CV
       * Experiences that match job requirements but need better phrasing
       * Achievements that could be reworded to match job criteria
       * Technical terms or industry language from the job posting

    Format your response as JSON:
    {
      "improvements": [
        {
          "original": "exact original text",
          "improved": "enhanced version aligned with job requirements",
          "explanation": "explain how this better matches specific job requirements: [quote relevant job requirement]",
          "location": "section location in CV",
          "impact": "high/medium/low",
          "matchedRequirements": ["list", "of", "matched", "job", "requirements"]
        }
      ]
    }`,
  
  COVER_LETTER: (cv, job, limit) => `
    Write a professional cover letter based on:
    CV: ${cv}
    Job Description: ${job}
    Requirements: 1. Professional tone 2. Highlight relevant skills
    3. Under ${limit} words 4. Address hiring manager
    5. Strong opening/closing`
};

export const IMPROVEMENT_TYPES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const IMPROVEMENT_CATEGORIES = {
  ACHIEVEMENT: 'achievement',
  SKILL: 'skill',
  EXPERIENCE: 'experience',
  QUALIFICATION: 'qualification'
};

export const MAX_IMPROVEMENTS = 5;
export const MIN_IMPROVEMENTS = 3;

export const WORD_COUNT_THRESHOLD = 5;
