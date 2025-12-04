import OpenAI from "openai";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false, // necesario para usar Busboy
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // --- 1. Leer form-data (imagen + textos) ---
    const { fields, fileBuffer } = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });

      const fields = {};
      const chunks = [];
      let hasFile = false;

      busboy.on("file", (_, file) => {
        hasFile = true;
        file.on("data", chunk => chunks.push(chunk));
      });

      busboy.on("field", (name, value) => {
        fields[name] = value;
      });

      busboy.on("finish", () => {
        if (!hasFile) return reject(new Error("No se recibió imagen"));
        resolve({ fields, fileBuffer: Buffer.concat(chunks) });
      });

      busboy.on("error", reject);

      req.pipe(busboy);
    });

    if (!fileBuffer) {
      return res.status(400).json({ error: "No se recibió imagen" });
    }

    // --- 2. Preparar cliente OpenAI ---
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const base64 = fileBuffer.toString("base64");

    const species = fields.species || "desconocida";
    const country = fields.country || "desconocido";

    // --- 3. Llamar a OpenAI Vision ---
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Eres un asistente veterinario. Analiza la imagen y describe el problema.
Especie: ${species}. País: ${country}.
Explica en lenguaje sencillo y aclara que no reemplaza al veterinario.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ],
        },
      ],
    });

    const summary =
      completion.choices?.[0]?.message?.content || "Sin datos generados";

    // --- 4. Respuesta simulada para el MVP ---
    return res.status(200).json({
      summary,
      severity: "leve",
      recommendedProducts: [
        {
          title: "Producto 1",
          reason: "Recomendado para aliviar irritación leve.",
          affiliateLink: "https://amazon.com",
        },
        {
          title: "Producto 2",
          reason: "Ayuda a mantener el área limpia.",
          affiliateLink: "https://amazon.com",
        },
        {
          title: "Producto 3",
          reason: "Apoyo general para recuperación.",
          affiliateLink: "https://amazon.com",
        },
      ],
    });

  } catch (err) {
    console.error("Error en API /diagnose:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
