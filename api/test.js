export default function handler(req, res) {
  return res.json({
    keyLoaded: !!process.env.OPENAI_API_KEY,
    keySample: process.env.OPENAI_API_KEY?.slice(0, 5) || null
  });
}
