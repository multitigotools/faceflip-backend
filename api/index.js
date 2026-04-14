module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image, style } = req.body;
    const HF_API_KEY = process.env.HF_API_KEY;

    // Use the SDXL base model, which is highly reliable on the free router
    const modelUrl = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

    const base64Data = image.split(',')[1];

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `A professional ${style} style digital art portrait, masterpiece, high detail`,
        parameters: {
          image: base64Data, // Image-to-image parameter for SDXL
          strength: 0.5      // Keeps the core face recognizable
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error || "HF Error" });
    }

    const buffer = await response.arrayBuffer();
    const outputBase64 = Buffer.from(buffer).toString("base64");
    return res.status(200).json({ image: outputBase64 });

  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};
