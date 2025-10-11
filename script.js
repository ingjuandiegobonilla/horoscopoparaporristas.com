document.addEventListener("DOMContentLoaded", async () => {
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("fecha").textContent = `Horóscopos para el ${hoy}`;

  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  
  try {
    const response = await fetch(`data/${month}-${day}.json`);
    if (!response.ok) throw new Error("No se encontró el archivo del día");
    const data = await response.json();
    renderHoroscopos(data);
  } catch (err) {
    document.getElementById("horoscopos").innerHTML = `
      <p>No se encontró el horóscopo del día 😢</p>
    `;
  }
});

function renderHoroscopos(data) {
  const container = document.getElementById("horoscopos");
  container.innerHTML = data.signos.map(signo => `
    <div class="signo">
      <img src="assets/icons/${signo.slug}.svg" alt="${signo.nombre}">
      <h2>${signo.nombre}</h2>
      <p>${signo.texto}</p>
    </div>
  `).join("");
}
