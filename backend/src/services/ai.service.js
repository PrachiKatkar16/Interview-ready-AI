const Groq = require("groq-sdk")
const {resume,selfDescription,jobDescription}=require('./temp')
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const html_to_pdf = require('html-pdf-node')


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
async function generatePdfFromHtml(htmlContent) {

  const file = { content: htmlContent }

  const options = {
    format: "A4"
  }

  const pdfBuffer = await html_to_pdf.generatePdf(file, options)

  return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

  const prompt = `
You are a professional resume writer.

Create a highly optimized resume tailored to this job description.

Original Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Improve the resume to maximize ATS compatibility and relevance.
`

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: 0.3,

    messages: [
      {
        role: "system",
        content: "Generate structured professional resumes."
      },
      {
        role: "user",
        content: prompt
      }
    ],

    response_format: {
      type: "json_schema",
      json_schema: {
        name: "optimized_resume",
        strict: true,

        schema: {
          type: "object",

          properties: {
            name: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },

            skills: {
              type: "array",
              items: { type: "string" }
            },

            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  role: { type: "string" },
                  duration: { type: "string" },
                  achievements: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["company", "role", "duration", "achievements"],
                additionalProperties: false
              }
            },

            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  technologies: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["name", "description", "technologies"],
                additionalProperties: false
              }
            },

            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  institution: { type: "string" },
                  degree: { type: "string" },
                  year: { type: "string" }
                },
                required: ["institution", "degree", "year"],
                additionalProperties: false
              }
            }
          },

          required:[
          "name",
          "title",
          "summary",
          "skills",
          "experience",
          "projects",
          "education"
        ],

          additionalProperties: false
        }
      }
    }
  })

  const resumeData = JSON.parse(
    response.choices[0].message.content
  )

  const htmlContent = `
<html>
<head>
<style>

body{
  font-family: Arial, sans-serif;
  margin:40px;
  color:#222;
}

.header{
  border-bottom:2px solid #333;
  padding-bottom:10px;
  margin-bottom:20px;
}

.name{
  font-size:28px;
  font-weight:bold;
}

.title{
  font-size:16px;
  color:#555;
}

.section{
  margin-top:25px;
}

.section h2{
  font-size:18px;
  border-bottom:1px solid #ccc;
  padding-bottom:4px;
  margin-bottom:10px;
}

.skills{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:5px;
}

ul{
  padding-left:18px;
}

.project{
  margin-bottom:10px;
}

.exp{
  margin-bottom:12px;
}

.company{
  font-weight:bold;
}

.role{
  font-style:italic;
}

</style>
</head>

<body>

<div class="header">
<div class="name">${resumeData.name}</div>
<div class="title">${resumeData.title}</div>
</div>

<div class="section">
<h2>Professional Summary</h2>
<p>${resumeData.summary}</p>
</div>

<div class="section">
<h2>Skills</h2>
<div class="skills">
${resumeData.skills.map(skill => `<div>• ${skill}</div>`).join("")}
</div>
</div>

<div class="section">
<h2>Experience</h2>

${resumeData.experience.map(exp => `
<div class="exp">
<div class="company">${exp.company}</div>
<div class="role">${exp.role} | ${exp.duration}</div>

<ul>
${exp.achievements.map(a => `<li>${a}</li>`).join("")}
</ul>
</div>
`).join("")}

</div>

<div class="section">
<h2>Projects</h2>

${resumeData.projects?.map(p => `
<div class="project">
<strong>${p.name}</strong>
<p>${p.description}</p>
<p><b>Technologies:</b> ${p.technologies.join(", ")}</p>
</div>
`).join("")}

</div>

<div class="section">
<h2>Education</h2>

${resumeData.education?.map(e => `
<div>
<strong>${e.degree}</strong> - ${e.institution} (${e.year})
</div>
`).join("")}

</div>

</body>
</html>
`


  const pdfBuffer = await generatePdfFromHtml(htmlContent)

  return pdfBuffer
}

module.exports={generateInterviewReport,generateResumePdf}