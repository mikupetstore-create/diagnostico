
import OpenAI from "openai";

export const config = {
  runtime: "nodejs",
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    let { image, species, country } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No se envió imagen" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta mascota. Especie: ${species}. País: ${country}. Detecta problemas visibles.`
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_output_tokens: 250
    });

    res.json({ diagnosis: completion.choices[0].message.content });

  } catch (err) {
    console.error("ERROR EN SERVIDOR >>>", err);
    res.status(500).json({ error: "Error procesando imagen" });
  }
}
