const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, style } = req.body;
  const HF_TOKEN = process.env.HF_TOKEN; 
  
  const models = {
    anime: "cagliostrolab/animagine-xl-3.1",
    caricature: "jbilcke-hf/ai-caricature",
    miniature: "toyxyz/miniature-world-diffusion",
    sketch: "artificialguybr/Sketchy-Style-LoRA"
  };

  try {
    const response = await fetch(
  "https://api-inference.huggingface.co/models/YOUR_MODEL",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: image
    }),
  }
);

const result = await response.arrayBuffer();
const base64 = Buffer.from(result).toString("base64");

return res.json({ image: base64 });
