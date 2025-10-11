document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const fechaParam = params.get("fecha");

  // 📅 Si hay query param ?fecha=DD-MM usa ese, si no usa la fecha actual
  const fecha = fechaParam || (() => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    return `${dia}-${mes}`;
  })();

  const [dia, mes] = fecha.split("-");
  const anioActual = new Date().getFullYear();

  // 🗓️ Generar una fecha legible: “10 de noviembre de 2025”
  const fechaLegible = new Date(anioActual, mes - 1, dia)
    .toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });


  document.getElementById("fecha").textContent = `Horóscopos para el ${fechaLegible}`;

  loadHoroscopo(fecha, fechaLegible);
});

function renderHoroscopos(data) {
  const container = document.getElementById("horoscopos");
  container.innerHTML = "";

  Object.entries(data).forEach(([signo, texto]) => {
    const slug = signo
      .toLowerCase()
      .normalize("NFD") // elimina acentos
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n"); // por si acaso
    
    const signoHTML = `
      <div class="signo">
        <img src="assets/icons/${slug}.svg" alt="${signo}">
        <h2>${signo}</h2>
        <p>${texto}</p>
      </div>
    `;
    container.innerHTML += signoHTML;
  });
}

async function loadHoroscopo(fecha, fechaLegible) {

  const url = `data/${fecha}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Archivo no encontrado");
    const data = await response.json();
    renderHoroscopos(data);
  } catch (error) {
    console.error(`❌ No se pudo cargar el horóscopo para ${fechaLegible}:`, error);
    document.getElementById("horoscopos").innerHTML =
      `<p class="error">No se encontró el horóscopo para el ${fechaLegible} 😢</p>`;
  }
}