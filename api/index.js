<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FaceFlip AI</title>
<style>
:root { --primary: #6366f1; --secondary: #a855f7; --bg: #f8fafc; }
body { font-family: 'Segoe UI', sans-serif; background: var(--bg); display: flex; justify-content: center; padding: 20px; }
.container { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px; width: 100%; text-align: center; }
.upload-area { border: 2px dashed #6366f1; padding: 30px; cursor: pointer; border-radius: 12px; margin-bottom: 15px; }
#preview { display: none; max-width: 100%; max-height: 400px; margin: 15px auto; border-radius: 10px; object-fit: contain; }
.buttons { display: none; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; }
.buttons button { padding: 12px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; }
.buttons button.selected { background: var(--primary); color: white; border-color: var(--primary); }
#flipBtn { display: none; margin-top: 20px; width: 100%; padding: 15px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; }
#status { margin-top: 15px; font-weight: 500; color: #64748b; }
</style>
</head>
<body>

<div class="container">
  <h2>FaceFlip AI</h2>
  <div class="upload-area" onclick="document.getElementById('fileInput').click()">
    <span id="uploadText">Click to upload photo</span>
    <input type="file" id="fileInput" hidden accept="image/*">
    <img id="preview" src="" alt="Preview">
  </div>
  <div class="buttons" id="styleOptions">
    <button onclick="setStyle(this, 'anime')">Anime</button>
    <button onclick="setStyle(this, 'caricature')">Caricature</button>
    <button onclick="setStyle(this, 'miniature')">Miniature</button>
    <button onclick="setStyle(this, 'sketch')">Sketch</button>
  </div>
  <button id="flipBtn" onclick="flipImage()">FLIP IT</button>
  <p id="status"></p>
</div>

<script>
let selectedStyle = "";
let base64Image = "";

document.getElementById('fileInput').onchange = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const imgElement = new Image();
    imgElement.src = event.target.result;
    imgElement.onload = function () {
      const canvas = document.createElement('canvas');
      let width = imgElement.width, height = imgElement.height;
      const max_size = 1024;
      if (width > height) { if (width > max_size) { height *= max_size / width; width = max_size; } }
      else { if (height > max_size) { width *= max_size / height; height = max_size; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgElement, 0, 0, width, height);
      base64Image = canvas.toDataURL('image/jpeg', 0.7);
      const imgPreview = document.getElementById('preview');
      imgPreview.src = base64Image;
      imgPreview.style.display = 'block';
      document.getElementById('uploadText').style.display = 'none';
      document.getElementById('styleOptions').style.display = 'grid';
      document.getElementById('flipBtn').style.display = 'block';
      document.getElementById("status").innerText = "Ready!";
    };
  };
  reader.readAsDataURL(file);
};

function setStyle(btn, style) {
  selectedStyle = style;
  document.querySelectorAll(".buttons button").forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

async function flipImage() {
  if (!base64Image || !selectedStyle) return alert("Select style and upload photo");
  const statusText = document.getElementById("status");
  statusText.innerText = "Processing... (approx 30s)";

  try {
    const response = await fetch("https://faceflip-backend.vercel.app/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image, style: selectedStyle })
    });

    const data = await response.json();
    if (response.ok && data.image) {
      document.getElementById("preview").src = "data:image/png;base64," + data.image;
      statusText.innerText = "Done ✅";
    } else {
      statusText.innerText = "Error: " + (data.details || data.error || "Failed");
    }
  } catch (err) {
    statusText.innerText = "Connection failed ❌";
  }
}
</script>
</body>
</html>
