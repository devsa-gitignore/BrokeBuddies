/**
 * PPT Text Extraction Service
 * Extracts text from PPTX (manual ZIP+XML parsing) and PDF (pdf-parse).
 * No complex libraries — just unzip the PPTX and read the XML text nodes.
 */

const AdmZip = require("adm-zip");
const pdfParse = require("pdf-parse");

/**
 * Extract text from a PPTX buffer.
 * PPTX is a ZIP file containing XML slides at ppt/slides/slide1.xml, slide2.xml, etc.
 * Text lives inside <a:t> tags in each slide XML.
 */
function extractFromPptx(buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  // Find all slide XML files and sort them by slide number
  const slideEntries = entries
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)/)[1]);
      const numB = parseInt(b.entryName.match(/slide(\d+)/)[1]);
      return numA - numB;
    });

  console.log(`[PPT-EXTRACT] Found ${slideEntries.length} slides in PPTX`);

  const slides = [];

  for (const entry of slideEntries) {
    const xml = entry.getData().toString("utf-8");

    // Extract all text between <a:t> tags
    const textParts = [];
    const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const decoded = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      textParts.push(decoded);
    }

    const slideNum = entry.entryName.match(/slide(\d+)/)[1];
    const slideText = textParts.join(" ").trim();

    if (slideText.length > 0) {
      slides.push(`--- Slide ${slideNum} ---\n${slideText}`);
    }
  }

  return slides.join("\n\n");
}

/**
 * Extract text from a PDF buffer.
 */
async function extractFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text || "";
}

/**
 * Extract text from a file buffer (PPTX or PDF).
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromFile = async (fileBuffer, originalName) => {
  const ext = originalName
    .toLowerCase()
    .substring(originalName.lastIndexOf("."));

  console.log(`[PPT-EXTRACT] Extracting from: ${originalName} (${ext})`);
  console.log(
    `[PPT-EXTRACT] File size: ${(fileBuffer.length / 1024).toFixed(1)} KB`,
  );

  let text = "";

  try {
    if (ext === ".pptx") {
      text = extractFromPptx(fileBuffer);
    } else if (ext === ".pdf") {
      text = await extractFromPdf(fileBuffer);
    } else {
      throw new Error(
        `Unsupported file type: ${ext}. Please upload .pptx or .pdf`,
      );
    }
  } catch (err) {
    console.error(`[PPT-EXTRACT] ❌ Failed:`, err.message);
    throw new Error(`Failed to extract text from ${ext} file: ${err.message}`);
  }

  if (!text || text.trim().length === 0) {
    throw new Error(
      "No text found in the file. It may be image-only or empty.",
    );
  }

  console.log(`[PPT-EXTRACT] ✅ Extracted ${text.length} characters`);
  console.log(`[PPT-EXTRACT] Preview: ${text.substring(0, 300)}...`);

  return text;
};

module.exports = { extractTextFromFile };
