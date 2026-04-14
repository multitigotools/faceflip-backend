module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { style } = req.body;

    const HF_API_KEY = process.env.HF_API_KEY;

    const model = "runwayml/stable-diffusion-v1-5";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `${style} style portrait of a person`
        }),
      }
    );

    const result = await response.arrayBuffer();
    const base64 = Buffer.from(result).toString("base64");

    return res.status(200).json({ image: base64 });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
