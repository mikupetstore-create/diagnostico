async function sendImage() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Sube una imagen");

  const base64 = await toBase64(file);

  const response = await fetch("/api/diagnose", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64.split(",")[1] })
  });

  const data = await response.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
