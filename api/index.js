module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { image, style } = req.body;

    if (!image || !style) {
      return res.status(400).json({ error: "Missing image or style" });
    }

    const HF_API_KEY = process.env.HF_API_KEY;

    const prompt = `${style} style portrait of a person, high quality`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt
        }),
      }
    );

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({ image: base64 });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
