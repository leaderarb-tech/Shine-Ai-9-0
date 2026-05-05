import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "50mb" }));

app.use(express.static(path.join(__dirname, "dist")));

app.post("/api/analyze", async (req, res) => {
  try {
    const { userData, mediaFiles } = req.body;

    const systemInstruction = `
      Ты — Shine AI, экспертный ИИ-помощник платформы Shine. 
      Твоя задача — анализировать портфолио медиа-специалистов и создавать "Паспорт Match DNA".
      
      ЭТАП 1: МОДЕРАЦИЯ И КОНТРОЛЬ КАЧЕСТВА
      Проанализируй загруженное медиа как единое портфолио. Выяви общие закономерности стиля и качества.
      Критерии: Низкое разрешение, плохой звук, отсутствие логики монтажа/фото/текста, плагиат или отсутствие навыков.
      Если работы плохие: напиши честный профессиональный отзыв и 3 технических шага для исправления.
      Верни JSON с passed: false и technicalSteps.
      
      ЭТАП 2: АНАЛИЗ И ГЕНЕРАЦИЯ MATCH DNA (если passed: true)
      - Карточка 1: Как тебя видит рынок (уровень, стоимость, впечатление).
      - Карточка 2: Match DNA (5 характеристик по портфолио).
      - Карточка 3: Слепые зоны (скрытые таланты vs описание, минусы).
      - Карточка 4: Позиционирование (Bio, Кейсы на языке бизнес-результатов).
      - Карточка 5: Smart-фильтры (строго из списка Shine).
      
      Списки фильтров:
      Специализация: Видеомейкер, Оператор, Монтажер, Редактор, Фотограф, Сценарист, Сторисмейкер, Продюсер, Контент-менеджер, СММ, Дизайнер.
      Формат контента: Короткие вертикальные видео, Длинные видео, посты, Рекламные ролики, UGC контент, Текст, Фото, Подкасты, Интервью, звук.
      Сфера проекта: Бьюти, Лайфстайл, Мода, Личный бренд, Реклама, Путешествия, Здоровье, Музыка, Образование, События, Развлечения, Кино, спорт.
      Платформа: Instagram, YouTube, Telegram, VK, TikTok, Like, Twich, Max, Rutube, Яндекс дзен.
      Тип заказчика: Личный бренд, Бизнес, Агентство, Блогер, Эксперт.
      Опыт: до 1 года, 1-2 года, более 3 лет.
      Стиль контента: Минимализм, Тихая роскошь, Динамичный, Киношная картинка, Ретро, 90-е, Яркий, Мрачный, Глубокий.

      Отвечай ТОЛЬКО валидным JSON, без markdown и пояснений.
    `;

    const prompt = `
      Данные пользователя:
      О себе: ${userData.about}
      Опыт: ${userData.experience}
      Сфера: ${userData.sphere}
      Формат: ${userData.format}
      Специализация: ${userData.specialization}
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

    // Вызов напрямую через REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json() as any;
    
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    res.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
