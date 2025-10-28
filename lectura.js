// --- Efecto de lectura progresiva y mensaje final --- //
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".texto-reflexion");
  if (!contenedor) return;

  const textoOriginal = contenedor.innerHTML.trim();
  const lineas = textoOriginal.split("<br>");
  contenedor.innerHTML = "";

  let index = 0;
  function mostrarLinea() {
    if (index < lineas.length) {
      const span = document.createElement("p");
      span.innerHTML = lineas[index];
      span.style.opacity = 0;
      span.style.transform = "translateY(20px)";
      contenedor.appendChild(span);

      setTimeout(() => {
        span.style.transition = "opacity 1.2s ease, transform 1.2s ease";
        span.style.opacity = 1;
        span.style.transform = "translateY(0)";
      }, 100);

      index++;
      setTimeout(mostrarLinea, 800); // Velocidad de aparición
    } else {
      mostrarMensajeFinal();
    }
  }

  function mostrarMensajeFinal() {
    const mensaje = document.createElement("div");
    mensaje.className = "mensaje-final";
    mensaje.textContent = "¿Aún sientes curiosidad? Continúa leyendo...";
    contenedor.appendChild(mensaje);
  }

  mostrarLinea();
});