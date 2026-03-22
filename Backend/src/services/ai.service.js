import { GoogleGenAI, Type } from "@google/genai";
import puppeteer from "puppeteer";
 import { zodToJsonSchema } from "zod-to-json-schema";
 import {z} from "zod"; 
const ai = new GoogleGenAI({
  apiKey: process.env.YOUR_GEMINI_API_KEY || "AIzaSyDozapO8SdkDQRebd3oOzi24oSW-oxEv-g"
});

const interviewReportSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: "The match score between candidate's profile and job description (0-100)"
    },
    technicalQuestions: {
      type: Type.ARRAY,
      description: "Technical interview questions",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Technical question asked in interview" },
          intention: { type: Type.STRING, description: "Why interviewer is asking this question" },
          answer: { type: Type.STRING, description: "How candidate should answer this question" }
        },
        required: ["question", "intention", "answer"]
      }
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      description: "Behavioral questions",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Behavioral interview question" },
          intention: { type: Type.STRING, description: "Why interviewer asks this behavioral question" },
          answer: { type: Type.STRING, description: "Best way candidate should answer" }
        },
        required: ["question", "intention", "answer"]
      }
    },
    skillGapAnalysis: {
      type: Type.ARRAY,
      description: "List of missing skills",
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING, description: "Skill that candidate is missing" },
          severity: { type: Type.STRING, description: "Skill gap severity (low, medium, high)" }
        },
        required: ["skill", "severity"]
      }
    },
    preparationPlan: {
      type: Type.ARRAY,
      description: "Daily interview preparation plan",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Day number e.g Day 1" },
          focus: { type: Type.STRING, description: "Focus topic of that day" },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tasks to complete that day" }
        },
        required: ["day", "focus", "tasks"]
      }
    },
    title: { type: Type.STRING, description: "Title of the interview report" }
  },
  required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGapAnalysis", "preparationPlan", "title"]
};


async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

const prompt = `
You are a senior technical interviewer and hiring manager.

Your task is to deeply evaluate a candidate based on the following:

--- Candidate Resume ---
${resume}

--- Job Description ---
${jobDescription}

--- Self Description ---
${selfDescription}

====================================

STRICT INSTRUCTIONS:

1. You MUST return ONLY valid JSON matching the given schema.
2. Do NOT include explanations, comments, or extra text outside JSON.

====================================

EVALUATION GUIDELINES:

1. Analyze how well the candidate matches the job description:
   - Skills match
   - Experience relevance
   - Project alignment

2. Identify strengths:
   - Technical strengths
   - Soft skills inferred from selfDescription

3. Identify weaknesses / gaps:
   - Missing skills
   - Lack of experience in required areas

4. Generate interview questions:
   - Technical Questions (based on job requirements)
   - Behavioral Questions (based on personality and experience)

5. Skill Gap Analysis:
   - Clearly mention missing or weak areas

6. Preparation Plan:
   - Step-by-step improvement plan
   - What to study
   - What to practice

====================================

QUALITY RULES:

- Be specific, not generic
- Questions should be realistic and job-relevant
- Avoid repeating content
- Keep answers concise but meaningful
- Use professional tone

====================================

OUTPUT FORMAT:

Return ONLY JSON that strictly follows the provided schema.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert technical interviewer. You must evaluate the candidate's resume against the given job description and output a strict JSON strictly adhering to the schema. Do not deviate from the schema.",
      responseMimeType: "application/json",
      responseSchema: interviewReportSchema
    }
  });

  return JSON.parse(response.text);
}
async function generatePdfForHtml(htmlContent) {
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(htmlContent, {
  waitUntil: 'networkidle2',
});
const pdfBuffer = await page.pdf({ format: 'A4' });
await browser.close();
return pdfBuffer;
}
export async function generateResumePdf({ resume, jobDescription, selfDescription }) {
  const resumePdfSchema = z.object({
    html: z.string().describe("HTML content of the resume which can be used to generate PDF")
  });
  const prompt = `
You are an expert resume designer and ATS optimization specialist.

Create a highly professional, modern, and clean resume based on the following inputs:

--- Candidate Resume ---
${resume}

--- Job Description ---
${jobDescription}

--- Self Description ---
${selfDescription}

========================

STRICT INSTRUCTIONS:

1. Output MUST be a valid JSON with ONLY one field:
{
  "html": "<complete HTML here>"
}

2. Generate COMPLETE HTML document:
- Include <!DOCTYPE html>, <html>, <head>, <body>

3. Styling Rules:
- Use ONLY inline CSS (NO external CSS, NO Google Fonts, NO CDN)
- Use clean, minimal, professional layout
- Use standard fonts like Arial, Helvetica, sans-serif
- Proper spacing, margins, headings, and sections

4. Resume Structure:
- Header (Name, Email, Phone, Location)
- Professional Summary (based on selfDescription + resume)
- Skills (relevant to jobDescription)
- Experience (if available in resume)
- Education
- Projects (if available)
- Certifications (if any)

5. Optimization:
- Tailor the resume according to the job description
- Highlight relevant skills and keywords
- Keep content concise and impactful

6. IMPORTANT (for PDF generation):
- DO NOT use:
  - external images
  - external fonts
  - scripts
- Keep layout simple and stable for PDF rendering

7. Make it visually attractive using:
- section headings with borders or background
- proper alignment
- readable font sizes

8. Ensure:
- HTML is VALID
- No broken tags
- No missing closing tags

ONLY return JSON. Do not include explanations.
`;
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: zodToJsonSchema(resumePdfSchema)
  }
});
const jsonContent = JSON.parse(response.text);
const pdfBuffer = await generatePdfForHtml(jsonContent.html);
return pdfBuffer;

}
export default  generateInterviewReport;