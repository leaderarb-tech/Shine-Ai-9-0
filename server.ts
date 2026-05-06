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
      
      ЭТАП 2: АНАЛИЗ И ГЕНЕРАЦИЯ MATCH DNA (если passed: true)
      Анализируй портфолио и заполни все поля.

      Списки фильтров (используй ТОЛЬКО значения из этих списков):
      Специализация: Видеомейкер, Оператор, Монтажер, Редактор, Фотограф, Сценарист, Сторисмейкер, Продюсер, Контент-менеджер, СММ, Дизайнер.
      Формат контента: Короткие вертикальные видео, Длинные видео, посты, Рекламные ролики, UGC контент, Текст, Фото, Подкасты, Интервью, звук.
      Сфера проекта: Бьюти, Лайфстайл, Мода, Личный бренд, Реклама, Путешествия, Здоровье, Музыка, Образование, События, Развлечения, Кино, спорт.
      Платформа: Instagram, YouTube, Telegram, VK, TikTok, Like, Twich, Max, Rutube, Яндекс дзен.
      Тип заказчика: Личный бренд, Бизнес, Агентство, Блогер, Эксперт.
      Опыт: до 1 года, 1-2 года, более 3 лет.
      Стиль контента: Минимализм, Тихая роскошь, Динамичный, Киношная картинка, Ретро, 90-е, Яркий, Мрачный, Глубокий.

      Верни ТОЛЬКО JSON строго в этом формате, без отклонений:
      {
        "passed": true или false,
        "rejectionReason": "причина если passed false, иначе null",
        "technicalSteps": ["шаг 1", "шаг 2", "шаг 3"] или [],
        "marketPerception": {
          "level": "уровень специалиста",
          "price": "ценовой сегмент",
          "impression": "общее впечатление"
        },
        "matchDNA": ["характеристика 1", "характеристика 2", "характеристика 3", "характеристика 4", "характеристика 5"],
        "blindSpots": "текст о слепых зонах",
        "positioning": {
          "bio": "текст bio",
          "experience": "описание опыта"
        },
        "filters": {
          "specialization": "одно значение из списка",
          "contentFormat": ["значение 1", "значение 2"],
          "sphere": ["значение 1", "значение 2"],
          "platform": ["значение 1"],
          "clientType": "одно значение из списка",
          "experience": "одно значение из списка",
          "style": "одно значение из списка"
        }
      }
    `;

    const prompt = `
      Данные пользователя:
      О себе: ${userData.about}
      Опыт: ${userData.experience}
      Сфера: ${userData.sphere}
      Формат: ${userData.format}
      Специализация: ${userData.specialization}
      
      Проанализируй это портфолио (приложенные медиа-файлы) и верни JSON строго в указанном формате.
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

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    res.json(parsed);

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
