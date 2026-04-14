module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image, style } = req.body;
    const HF_API_KEY = process.env.HF_API_KEY;

    // Remove the data URL prefix (e.g., "data:image/png;base64,")
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: base64Data, // The image itself is the input
          parameters: {
            prompt: `A professional ${style} digital art portrait, highly detailed, 4k`,
            num_inference_steps: 30,
            strength: 0.6 // 0.6 keeps 40% of your original face and 60% AI style
          },
        })
      }
    );

    // If the model is still loading
    if (response.status === 503) {
      return res.status(503).json({ error: "Model is starting up. Try again in 20 seconds." });
    }

    const buffer = await response.arrayBuffer();
    const outputBase64 = Buffer.from(buffer).toString("base64");

    // Check if the output is actually an image or just a JSON error message
    if (outputBase64.length < 500) { 
        const textError = Buffer.from(buffer).toString();
        return res.status(500).json({ error: "AI Error", details: textError });
    }

    return res.status(200).json({ image: outputBase64 });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
