import OpenAI from "openai";
import formidable from "formidable-serverless";
import fs from "fs";

// Deshabilitar body parser por defecto
export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;

      if (!files.image) {
        return res.status(400).json({ error: "No se envió imagen" });
      }

      // Leer imagen como base64
      const imgBuffer = fs.readFileSync(files.image.filepath);
      const imgBase64 = imgBuffer.toString("base64");

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
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${imgBase64}`
              }
            ]
          }
        ],
        max_output_tokens: 200
      });

      res.status(200).json({ diagnosis: completion.choices[0].message.content });

    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ error: "Error procesando imagen" });
    }
  });
}
