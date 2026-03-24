const { GoogleGenAI, Type } = require("@google/genai");

// ✅ FIX 1: puppeteer replace
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const { zodToJsonSchema } = require("zod-to-json-schema");
const { z } = require("zod");

// ✅ FIX 2: API key secure
const ai = new GoogleGenAI({
  apiKey: process.env.YOUR_GEMINI_API_KEY
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
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING }
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
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING }
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
          skill: { type: Type.STRING },
          severity: { type: Type.STRING }
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
          day: { type: Type.STRING },
          focus: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["day", "focus", "tasks"]
      }
    },
    title: { type: Type.STRING }
  },
  required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGapAnalysis", "preparationPlan", "title"]
};

// ================= INTERVIEW REPORT =================

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

const prompt = `
You are a highly experienced senior technical interviewer, talent evaluator, and hiring manager with 15+ years of experience.

Your task is to provide an exhaustive evaluation of a candidate against the job description using the inputs below:

--- Candidate Resume ---
${resume}

--- Job Description ---
${jobDescription}

--- Self Description ---
${selfDescription}

====================================

STRICT INSTRUCTIONS:

1. Output MUST be valid JSON strictly following the schema provided.
2. Do NOT include any extra text, explanation, comments, or formatting outside the JSON.
3. Include all fields: matchScore, technicalQuestions[], behavioralQuestions[], skillGapAnalysis[], preparationPlan[].
4. Ensure all objects have all required keys. Use realistic values. 
5. Avoid generic or repetitive content. Be precise and detailed.

====================================

EVALUATION GUIDELINES:

1. Match Score:
   - Evaluate skills, experience, projects, and relevance to job description.
   - Return an integer from 0-100.

2. Strengths:
   - Highlight technical strengths, frameworks, languages, tools.
   - Include inferred soft skills from selfDescription.

3. Weaknesses / Gaps:
   - Identify missing or weak skills.
   - Mention gaps in experience relative to job description.

4. Technical Questions:
   - Generate 5-10 realistic questions relevant to the job role.
   - Include "question", "intention", and example "answer" fields.

5. Behavioral Questions:
   - Generate 3-5 questions assessing problem-solving, teamwork, leadership, communication.
   - Include "question", "intention", and example "answer".

6. Skill Gap Analysis:
   - Provide skills with "skill" and "severity" ("low", "medium", "high").

7. Preparation Plan:
   - Provide a clear day-by-day improvement roadmap.
   - Include "day", "focus", and list of actionable "tasks" to improve weak areas.

====================================

QUALITY RULES:

- Be specific and job-relevant, no vague statements.
- Questions must be realistic and reflect industry standards.
- Avoid repeating skills or questions.
- Answers should be concise, accurate, and professional.
- Maintain consistent and formal tone.

====================================

OUTPUT FORMAT:

Return ONLY valid JSON strictly matching the schema:

{
  "matchScore": number,
  "technicalQuestions": [
    { "question": string, "intention": string, "answer": string }
  ],
  "behavioralQuestions": [
    { "question": string, "intention": string, "answer": string }
  ],
  "skillGapAnalysis": [
    { "skill": string, "severity": "low"|"medium"|"high" }
  ],
  "preparationPlan": [
    { "day": number, "focus": string, "tasks": [string] }
  ]
}
`;


// ✅ Retry logic added (important)
async function callAI(retries = 3) {
  try {
    return await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert technical interviewer.",
        responseMimeType: "application/json",
        responseSchema: interviewReportSchema
      }
    });
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 2000));
      return callAI(retries - 1);
    }
    throw err;
  }
}

const response = await callAI();
return JSON.parse(response.text);
}

// ================= PDF GENERATION =================

async function generatePdfForHtml(htmlContent) {

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0',
  });

  const pdfBuffer = await page.pdf({ 
    format: 'A4',
    printBackground: true
  });

  await browser.close();
  return pdfBuffer;
}

// ================= RESUME PDF =================

async function generateResumePdf({ resume, jobDescription, selfDescription }) {

  const resumePdfSchema = z.object({
    html: z.string()
  });

const prompt = `
You are an expert resume designer, career consultant, and ATS optimization specialist.

Create a highly professional, visually appealing, and modern resume based on the following inputs:

--- Candidate Resume ---
${resume}

--- Job Description ---
${jobDescription}

--- Self Description ---
${selfDescription}

====================================

STRICT INSTRUCTIONS:

1. Output MUST be valid JSON with only one key: { "html": "<complete HTML here>" }.
2. Generate a fully complete HTML document:
   - Include <!DOCTYPE html>, <html>, <head>, <body>.
   - Use only inline CSS. No external CSS, fonts, or scripts.
   - Ensure layout is clean, minimal, professional, and suitable for PDF generation.

3. Layout & Styling:
   - Use standard fonts: Arial, Helvetica, sans-serif.
   - Proper spacing, margins, headings, and sections.
   - Section headings should be visually distinct (background color or border).
   - Ensure readability: font sizes, alignment, white space.
   - Avoid broken tags or invalid HTML.

4. Resume Structure:
   - Header: Name, Email, Phone, Location.
   - Professional Summary: Concise, impactful, tailored to job.
   - Skills: Highlight relevant to jobDescription, grouped logically.
   - Experience: Company, role, duration, key achievements.
   - Education: Degree, institution, years.
   - Projects: Highlight key achievements if present in resume.
   - Certifications: Include if mentioned.
   
5. Optimization:
   - Tailor content to jobDescription.
   - Include keywords for ATS.
   - Keep sections concise and impactful.
   - Maintain professional tone.

6. Important:
   - Do NOT include images, external fonts, scripts, or external resources.
   - HTML must be fully renderable in browser and PDF.

ONLY RETURN JSON. Do not include explanations or extra text.
`;

// ✅ Retry logic
async function callAI(retries = 3) {
  try {
    return await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumePdfSchema)
      }
    });
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 2000));
      return callAI(retries - 1);
    }
    throw err;
  }
}

const response = await callAI();

const jsonContent = JSON.parse(response.text);

const pdfBuffer = await generatePdfForHtml(jsonContent.html);

return pdfBuffer;
}

// ================= EXPORT =================

module.exports = {
  generateInterviewReport,
  generateResumePdf
};