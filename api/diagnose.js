import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { image, species, country } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No se envió imagen" });
    }

    // Asegurar formato DataURL
    const base64 = image.startsWith("data:")
      ? image
      : `data:image/jpeg;base64,${image}`;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analiza esta mascota. Especie: ${species}. País: ${country}. Detecta problemas visibles.`,
            },
            {
              type: "input_image",
              image_url: base64,
            },
          ],
        },
      ],
      max_output_tokens: 250,
    });

    res.status(200).json({
      diagnosis: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error("ERROR EN SERVIDOR:", err);
    res.status(500).json({ error: "Error procesando imagen" });
  }
}
