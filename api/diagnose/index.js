// /api/diagnose/index.js
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    // Parse FormData
    const data = await new Promise((resolve, reject) => {
      const busboy = require("busboy")({ headers: req.headers });
      const fields = {};
      let fileBuffer = null;

      busboy.on("file", (fieldname, file) => {
        const chunks = [];
        file.on("data", c => chunks.push(c));
        file.on("end", () => fileBuffer = Buffer.concat(chunks));
      });

      busboy.on("field", (fieldname, value) => fields[fieldname] = value);
      busboy.on("finish", () => resolve({ fields, fileBuffer }));
      req.pipe(busboy);
    });

    if (!data.fileBuffer) {
      return res.status(400).json({ error: "No se recibió imagen" });
    }

    // OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const base64 = data.fileBuffer.toString("base64");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Describe el posible problema de esta mascota.` },
            { type: "image_url", image_url: `data:image/jpeg;base64,${base64}` }
          ]
        }
      ]
    });

    const summary = completion.choices[0].message.content || "Sin datos";

    // Resultado dummy para MVP
    res.status(200).json({
      summary,
      severity: "leve",
      recommendedProducts: [
        {
          title: "Producto 1",
          reason: "Razón generada",
          affiliateLink: "https://amazon.com"
        },
        {
          title: "Producto 2",
          reason: "Razón generada",
          affiliateLink: "https://amazon.com"
        },
        {
          title: "Producto 3",
          reason: "Razón generada",
          affiliateLink: "https://amazon.com"
        }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
}
