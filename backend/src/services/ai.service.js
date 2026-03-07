const Groq = require("groq-sdk")
const {resume,selfDescription,jobDescription}=require('./temp')
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateInterviewReport(){
    const prompt = `
Generate an interview report for this candidate.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

const response = await groq.chat.completions.create({
  model: "openai/gpt-oss-20b",

  messages: [
    {
      role: "system",
      content: "Generate structured interview preparation reports."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  max_tokens: 4000,
  temperature: 0.3,

  response_format: {
    type: "json_schema",

    json_schema: {
      name: "interview_report",
      strict: true,

      schema: {
        type: "object",

        properties: {
          matchScore: { type: "number", minimum: 0, maximum: 100 },

          title: { type: "string" },

          technicalQuestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                intention: { type: "string" },
                answer: { type: "string" }
              },
              required: ["question", "intention", "answer"],
              additionalProperties: false
            }
          },

          behavioralQuestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                intention: { type: "string" },
                answer: { type: "string" }
              },
              required: ["question", "intention", "answer"],
              additionalProperties: false
            }
          },

          skillGaps: {
            type: "array",

            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                severity: {
                  type: "string",
                  enum: ["Low", "Medium", "High"]
                }
              },
              required: ["skill", "severity"],
              additionalProperties: false
            }
          },

          preparationPlan: {
            type: "array",
            items: {
              type: "object",
              description: "A day-wise preparation plan for the candidate to improve their chances of success in the interview.",
              properties: {
                day: { type: "number" },
                focus: { type: "string" },
                tasks: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["day", "focus", "tasks"],
              additionalProperties: false
            }
          }
        },

        required: [
          "matchScore",
          "title",
          "technicalQuestions",
          "behavioralQuestions",
          "skillGaps",
          "preparationPlan"
        ],

        additionalProperties: false
      }
    }
  }
});

const result = JSON.parse(response.choices[0].message.content || "{}");

// console.log(JSON.stringify(result, null, 2));
return result;

}

module.exports=generateInterviewReport