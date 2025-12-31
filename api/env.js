export default function handler(req, res) {
  const payload = {
    OPENWEATHER_API_KEY:
      process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  };

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(payload);
}