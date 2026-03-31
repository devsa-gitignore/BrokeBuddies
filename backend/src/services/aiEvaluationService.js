/**
 * AI PPT Evaluation Service
 * Uses OpenRouter API (OpenAI-compatible) to evaluate hackathon PPT submissions.
 * Falls back through multiple free models for reliability.
 */

const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// openrouter/free auto-picks the best available free model
const MODEL_FALLBACK_CHAIN = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-12b-it:free",
  "qwen/qwen3-4b:free",
];

const SYSTEM_PROMPT = `You are a hackathon judge. Score the PPT on 4 criteria (each /10): Content, Design, Innovation, Feasibility. Return ONLY valid JSON with this exact structure:
{"scores":{"Content":{"score":0,"justification":""},"Design":{"score":0,"justification":""},"Innovation":{"score":0,"justification":""},"Feasibility":{"score":0,"justification":""}},"strengths":[],"weaknesses":[],"missing_elements":[],"slide_level_feedback":[{"slide_number":1,"issues":[],"suggestions":[]}],"risk_flags":[],"recommendation":"Shortlist or Borderline or Reject","final_summary":""}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Try a single model via OpenRouter.
 */
const tryModel = async (apiKey, modelName, userPrompt) => {
  console.log(`[AI-EVAL] Trying model: ${modelName}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: modelName,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://hackfire.app",
          "X-Title": "HackFire PPT Evaluator",
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    const rawText = response.data.choices[0].message.content;
    const modelUsed = response.data.model || modelName;

    console.log(`[AI-EVAL] ✅ ${modelUsed} responded`);
    console.log(`[AI-EVAL] Raw length: ${rawText.length} characters`);
    console.log(`[AI-EVAL] Raw preview: ${rawText.substring(0, 500)}`);

    // Clean potential markdown code fences
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Extract JSON if surrounded by other text
    const jsonStart = cleanedText.indexOf("{");
    const jsonEnd = cleanedText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleanedText);
    console.log("[AI-EVAL] ✅ JSON parse SUCCESS");
    console.log("[AI-EVAL] Recommendation:", parsed.recommendation);
    console.log("[AI-EVAL] Scores:", JSON.stringify(parsed.scores));

    return { evaluation: parsed, modelUsed };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

/**
 * Evaluate PPT text content using OpenRouter AI.
 * Uses a model fallback chain for reliability.
 * @param {string | string[]} pptText - The extracted PPT text (string or array of slide texts)
 * @returns {Promise<Object>} - Structured evaluation JSON
 */
const evaluatePPT = async (pptText) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured in environment variables. Get one free at https://openrouter.ai/keys",
    );
  }

  // Format input: handle both string and slide-by-slide array
  let formattedInput;
  if (Array.isArray(pptText)) {
    formattedInput = pptText
      .map((slide, i) => `--- Slide ${i + 1} ---\n${slide}`)
      .join("\n\n");
  } else {
    formattedInput = pptText;
  }

  console.log("========== AI PPT EVALUATION (OpenRouter) ==========");
  console.log("[AI-EVAL] PPT text received:");
  console.log(`[AI-EVAL] Input length: ${formattedInput.length} characters`);
  console.log(`[AI-EVAL] Preview: ${formattedInput.substring(0, 500)}...`);

  const userPrompt = `Here is the PPT content to evaluate:\n\n${formattedInput}\n\nReturn ONLY the JSON evaluation object, nothing else.`;

  const errors = [];

  // Try each model in the fallback chain
  for (const modelName of MODEL_FALLBACK_CHAIN) {
    try {
      const { evaluation, modelUsed } = await tryModel(
        apiKey,
        modelName,
        userPrompt,
      );
      console.log(`[AI-EVAL] ✅ Success with model: ${modelUsed}`);
      console.log("=====================================================");
      return evaluation;
    } catch (err) {
      const status = err.response?.status;
      const errMsg =
        err.response?.data?.error?.message || err.message || "Unknown error";

      console.error(
        `[AI-EVAL] ❌ ${modelName} failed (${status || "N/A"}): ${errMsg.substring(0, 200)}`,
      );
      errors.push({ model: modelName, error: errMsg });

      if (status === 429 || status === 503) {
        console.log(
          `[AI-EVAL] ⚠️ Rate limited / unavailable on ${modelName}, trying next...`,
        );
        await sleep(1000);
        continue;
      }

      // For parse errors, retry same model once
      if (errMsg.includes("JSON") || errMsg.includes("Unexpected token")) {
        console.log(`[AI-EVAL] Retrying ${modelName} (JSON parse issue)...`);
        try {
          await sleep(500);
          const { evaluation, modelUsed } = await tryModel(
            apiKey,
            modelName,
            userPrompt,
          );
          console.log(`[AI-EVAL] ✅ Retry success with: ${modelUsed}`);
          console.log("=====================================================");
          return evaluation;
        } catch (retryErr) {
          console.error(`[AI-EVAL] ❌ ${modelName} retry failed`);
          errors.push({
            model: `${modelName} (retry)`,
            error: retryErr.message,
          });
        }
      }

      continue;
    }
  }

  // All models exhausted
  console.error("[AI-EVAL] ❌ ALL MODELS EXHAUSTED. Errors:");
  errors.forEach((e) =>
    console.error(`  - ${e.model}: ${e.error.substring(0, 150)}`),
  );
  console.log("=====================================================");

  throw new Error(
    `AI evaluation failed across all models. Please check your OPENROUTER_API_KEY and try again.`,
  );
};

module.exports = { evaluatePPT };
