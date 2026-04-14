module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image, style } = req.body;
    const HF_API_KEY = process.env.HF_API_KEY;

    // Use the new stable router URL
    const modelUrl = "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5";

    // Clean the base64 and convert it back to a Buffer for binary transmission
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "image/jpeg", // Sending raw image data is more reliable
        "x-use-cache": "false"
      },
      body: imageBuffer,
      // Pass style parameters as custom headers if supported, or stick to default prompt
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: "HF Error", details: errorText });
    }

    const buffer = await response.arrayBuffer();
    const outputBase64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({ image: outputBase64 });

  } catch (error) {
    return res.status(500).json({ error: "fetch failed", details: error.message });
  }
};
