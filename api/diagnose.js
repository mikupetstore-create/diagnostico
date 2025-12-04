import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { image } = req.body;

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
            { type: "input_text", text: "Describe esta imagen de una mascota y detecta problemas visibles" },
            { type: "input_image", image_url: image }
          ]
        }
      ],
      max_output_tokens: 200
    });

    res.status(200).json({ diagnosis: completion.choices[0].message.content });

  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: "Error procesando imagen" });
  }
}
