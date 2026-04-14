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

    const prompt = `A ${style} style digital art portrait, highly detailed, 4k, professional`;

   let response;

for (let i = 0; i < 3; i++) {
  response = await fetch(
   "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    }
  );

  if (response.status === 503) {
    await new Promise(r => setTimeout(r, 5000));
  } else {
    break;
  }
}
    // 👇 ADD THIS BLOCK (VERY IMPORTANT)
const contentType = response.headers.get("content-type");

if (contentType && contentType.includes("application/json")) {
  const error = await response.json();
  return res.status(500).json({ error });
}

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({ image: base64 });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
