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

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analiza esta mascota (${species}, ${country})` },
            { type: "image_url", image_url: { url: image } }
          ]
        }
      ]
    });

    res.status(200).json({
      diagnosis: completion.choices[0].message.content
    });

  } catch (err) {
    console.log("ERR BACKEND:", err);
    res.status(500).json({ error: "Error procesando imagen" });
  }
}
