// api/analyze.js

import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Falta imagen" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const aiResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analiza esta imagen de una mascota. Di qué ves y qué posibles cuidados necesita, cosas simples, tipo preliminar. Luego dime 3 productos esenciales de Amazon para mejorar lo que ves." },
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            }
          ]
        }
      ]
    });

    const text = aiResponse.choices[0].message.content;

    res.status(200).json({ result: text });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error interno" });
  }
}
