import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log("🔑 API Key detectada:", process.env.OPENAI_API_KEY ? "✅ OK" : "❌ No encontrada");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SIGNS = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
];

const dataDir = path.resolve("data");
const cacheFile = path.resolve("cache.json");
const progressFile = path.resolve("progress.json");

// --- Estado local ---
let cache = {};
let progress = { currentIndex: 0 };

if (fs.existsSync(cacheFile)) {
  cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
}
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, "utf8"));
}

function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf8");
}

function saveProgress() {
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2), "utf8");
}

function getAllDates() {
  const dates = [];
  const year = 2024; // bisiesto, así incluimos 29 feb
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${month}-${day}`);
  }
  return dates;
}

async function generateHoroscope(sign, date) {
  const cacheKey = `${date}_${sign}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const prompt = `
Genera un horóscopo divertido, optimista y con energía positiva para una porrista del signo ${sign}.
Debe sonar alegre, breve (una o dos frases), sin mencionar planetas ni astrología.
Fecha: ${date}.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
    max_tokens: 80,
  });

  const text = response.choices[0].message.content.trim();
  cache[cacheKey] = text;
  saveCache();
  return text;
}

async function main() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const dates = getAllDates();
  const total = dates.length;

  console.log(`🗓️  Generando horóscopos para ${total} días...`);

  for (let i = progress.currentIndex; i < total; i++) {
    const date = dates[i];
    const filePath = path.join(dataDir, `${date}.json`);
    console.log("filePath", filePath);
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Saltando ${date} (ya existe)`);
      progress.currentIndex = i + 1;
      saveProgress();
      continue;
    }

    console.log(`🪄 Generando horóscopos para ${date} (${i + 1}/${total})...`);
    const horoscopes = {};

    for (const sign of SIGNS) {
      const text = await generateHoroscope(sign, date);
      horoscopes[sign] = text;
      console.log(`✨ ${sign}: ${text}`);
    }

    fs.writeFileSync(filePath, JSON.stringify(horoscopes, null, 2), "utf8");

    progress.currentIndex = i + 1;
    saveProgress();
    console.log(`💾 Guardado ${date}.json`);
  }

  console.log("🎉 ¡Horóscopos completos para todo el año!");
}

main();
