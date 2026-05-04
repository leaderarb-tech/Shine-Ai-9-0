import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "50mb" }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Отдаём собранный фронтенд
app.use(express.static(path.join(__dirname, "dist")));

// Прокси-эндпоинт для Gemini
app.post("/api/analyze", async (req, res) => {
  try {
    const { userData, mediaFiles } = req.body;

    const systemInstruction = `...`; // скопируй из geminiService.ts

    const prompt = `
      Данные пользователя:
      О себе: ${userData.about}
      Опыт (заявленный): ${userData.experience}
      Сфера: ${userData.sphere}
      Формат: ${userData.format}
      Специализация: ${userData.specialization}
      
      Проанализируй это портфолио и выяви общие закономерности стиля и качества.
    `;

    const parts: any[] = [{ text: prompt }];
    for (const file of mediaFiles || []) {
      parts.push({
        inlineData: {
          data: file.base64.split(",")[1] || file.base64,
          mimeType: file.type,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Все остальные запросы → фронтенд
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
