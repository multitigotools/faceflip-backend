module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image, style } = req.body;
    if (!image || !style) return res.status(400).json({ error: "Missing image/style" });

    const HF_API_KEY = process.env.HF_API_KEY;
    
    // We use a model that supports Image-to-Image well
    // Switching to a more modern/fast free model
    const modelUrl = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

    // Clean base64 string (remove data:image/png;base64, if present)
    const cleanBase64 = image.split(',')[1] || image;

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `A professional ${style} of the person in the image, high quality, artistic`,
        parameters: {
          image: cleanBase64, // THIS is the missing link for Image-to-Image
          denoising_strength: 0.6, // Higher = more 'style', Lower = more 'like you'
        }
      }),
    });

    if (response.status === 503) {
        return res.status(503).json({ error: "Model is loading. Try again in 30 seconds." });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({ image: base64 });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
