const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

/**
 * AI Service for PPT Review using Gemini 1.5
 */
class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async generatePPTReview(pptUrl, teamData) {
        try {
            const { teamName, scores, totalScore, cutoffScore, criteria } = teamData;

            // 1. Download PPT as buffer
            const response = await axios.get(pptUrl, { responseType: 'arraybuffer' });
            const pptBuffer = Buffer.from(response.data);

            const prompt = `
You are an expert hackathon evaluator.

A team ("${teamName}") has submitted the attached PPT for Round 1 evaluation.

Evaluation Criteria:
${criteria.map(c => `- ${c.name} (out of ${c.maxScore})`).join('\n')}

Scores Received:
${scores.map(s => `${s.name}: ${s.score}`).join('\n')}

Total Score: ${totalScore}/${criteria.reduce((acc, c) => acc + c.maxScore, 0)}
Cutoff Score: ${cutoffScore}

Your Task:

1. Analyze the entire PPT slide-by-slide.
2. Identify strengths.
3. Identify weaknesses.
4. Explain why the team may not have qualified (if below cutoff).
5. Suggest concrete improvements for each weak criterion.
6. Give slide-level improvement suggestions.
7. Provide actionable recommendations, not generic feedback.

Return output in structured JSON format:

{
  "summary": "...",
  "strengths": [],
  "weaknesses": [],
  "slide_level_feedback": [
    {
      "slide_number": 1,
      "issues": [],
      "suggestions": []
    }
  ],
  "criterion_improvement": {
    "Content": "...",
    "Design": "...",
    "Innovation": "...",
    "Feasibility": "..."
  },
  "final_advice": "..."
}
`;

            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: pptBuffer.toString("base64"),
                        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    }
                }
            ]);

            const text = result.response.text();

            // Extract JSON from response (handling potential markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Could not parse JSON from AI response");

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error("AI Review Generation Error:", error);
            throw error;
        }
    }
}

module.exports = new AIService();
