async function sendImage() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Sube una imagen");

  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64Image = reader.result.split(",")[1];

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "data:image/jpeg;base64," + base64Image })
      });

      const json = await res.json();

      document.getElementById("output").textContent =
        json.error || json.diagnosis || "Sin respuesta";
    } catch (e) {
      document.getElementById("output").textContent = "Error al conectar con el servidor";
    }
  };

  reader.readAsDataURL(file);
}
