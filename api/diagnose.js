import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("Form error:", err);
        return res.status(500).json({ error: "Error procesando imagen" });
      }

      if (!files.image) {
        return res.status(400).json({ error: "No se envió imagen" });
      }

      const filePath = files.image.filepath;
      const buffer = fs.readFileSync(filePath);
      const base64Image = buffer.toString("base64");

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
                type: "input_text",
                text: "Describe esta mascota y señala problemas visibles."
              },
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${base64Image}`
              }
            ]
          }
        ],
        max_output_tokens: 200
      });

      res.status(200).json({ diagnosis: completion.choices[0].message.content });

    } catch (e) {
      console.error("Server error:", e);
      res.status(500).json({ error: "Error procesando imagen" });
    }
  });
}
