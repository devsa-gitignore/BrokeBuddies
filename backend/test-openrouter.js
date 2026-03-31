const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.OPENROUTER_API_KEY;

const models = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "deepseek/deepseek-r1-0528:free",
  "qwen/qwen3-4b:free",
];

async function testModel(model) {
  try {
    console.log(`\nTesting: ${model}`);
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [
          { role: "user", content: 'Reply with ONLY: {"greeting": "hello"}' },
        ],
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );
    console.log(
      "  ✅ SUCCESS:",
      res.data.choices[0].message.content.substring(0, 100),
    );
    return true;
  } catch (e) {
    console.log(
      `  ❌ ${e.response?.status || "N/A"}: ${(e.response?.data?.error?.message || e.message).substring(0, 150)}`,
    );
    return false;
  }
}

(async () => {
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) break;
  }
})();
