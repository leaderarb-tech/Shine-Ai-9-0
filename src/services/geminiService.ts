import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ShineAnalysis {
  passed: boolean;
  rejectionReason?: string;
  technicalSteps?: string[];
  marketPerception?: {
    level: string;
    price: string;
    impression: string;
  };
  matchDNA?: string[];
  blindSpots?: string;
  positioning?: {
    bio: string;
    experience: string;
  };
  filters?: {
    specialization: string;
    contentFormat: string[];
    sphere: string[];
    platform: string[];
    clientType: string;
    experience: string;
    style: string;
  };
}

export async function analyzeProfile(
  userData: {
    about: string;
    experience: string;
    sphere: string;
    format: string;
    specialization: string;
  },
  mediaFiles: Array<{ base64: string; type: string }> = []
): Promise<ShineAnalysis> {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    Ты — Shine AI, экспертный ИИ-помощник платформы Shine. 
    Твоя задача — анализировать портфолио медиа-специалистов (может быть несколько работ) и создавать "Паспорт Match DNA".
    
    ЭТАП 1: МОДЕРАЦИЯ И КОНТРОЛЬ КАЧЕСТВА
    Проанализируй загруженное медиа (видео/фото) как единое комплексное портфолио. Выяви общие закономерности стиля и качества.
    Критерии: Низкое разрешение, плохой звук, отсутствие логики монтажа/фото/текста, плагиат или отсутствие навыков.
    Если работы плохие: Напиши пользователю честный, но профессиональный отзыв: почему портфолио не может быть опубликовано в Shine и какие 3 технических шага нужно сделать, чтобы исправить ситуацию.
    Верни JSON с passed: false и technicalSteps.
    
    ЭТАП 2: АНАЛИЗ И ГЕНЕРАЦИЯ MATCH DNA (если passed: true)
    - Карточка 1: Как тебя видит рынок (уровень, стоимость, впечатление).
    - Карточка 2: Match DNA (5 характеристик, выявленных по портфолио).
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

    Ответ должен быть строго в формате JSON.
  `;

  const prompt = `
    Данные пользователя:
    О себе: ${userData.about}
    Опыт (заявленный): ${userData.experience}
    Сфера: ${userData.sphere}
    Формат: ${userData.format}
    Специализация: ${userData.specialization}
    
    Проанализируй это портфолио (приложенные медиа-файлы) и выяви общие закономерности стиля и качества.
  `;

  const parts: any[] = [{ text: prompt }];
  
  for (const file of mediaFiles) {
    parts.push({
      inlineData: {
        data: file.base64.split(",")[1] || file.base64,
        mimeType: file.type,
      },
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.BOOLEAN },
          rejectionReason: { type: Type.STRING },
          technicalSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketPerception: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING },
              price: { type: Type.STRING },
              impression: { type: Type.STRING },
            },
          },
          matchDNA: { type: Type.ARRAY, items: { type: Type.STRING } },
          blindSpots: { type: Type.STRING },
          positioning: {
            type: Type.OBJECT,
            properties: {
              bio: { type: Type.STRING },
              experience: { type: Type.STRING },
            },
          },
          filters: {
            type: Type.OBJECT,
            properties: {
              specialization: { type: Type.STRING },
              contentFormat: { type: Type.ARRAY, items: { type: Type.STRING } },
              sphere: { type: Type.ARRAY, items: { type: Type.STRING } },
              platform: { type: Type.ARRAY, items: { type: Type.STRING } },
              clientType: { type: Type.STRING },
              experience: { type: Type.STRING },
              style: { type: Type.STRING },
            },
          },
        },
        required: ["passed"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
