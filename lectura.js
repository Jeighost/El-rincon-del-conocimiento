// ============================================
// LECTURA.JS - Efecto de lectura progresiva
// ============================================

(function() {
  'use strict';

  document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".texto-reflexion");
    
    // Si no existe el contenedor, salir
    if (!contenedor) return;

    const textoOriginal = contenedor.innerHTML.trim();
    const lineas = textoOriginal.split("<br>");
    
    // Limpiar contenedor
    contenedor.innerHTML = "";

    let index = 0;
    const velocidadAparicion = 600; // Milisegundos entre líneas

    function mostrarLinea() {
      if (index < lineas.length) {
        // Crear elemento para la línea
        const parrafo = document.createElement("p");
        parrafo.innerHTML = lineas[index];
        parrafo.style.opacity = '0';
        parrafo.style.transform = 'translateY(20px)';
        parrafo.style.marginBottom = '1rem';
        
        contenedor.appendChild(parrafo);

        // Animar aparición
        setTimeout(() => {
          parrafo.style.transition = 'opacity 1s ease, transform 1s ease';
          parrafo.style.opacity = '1';
          parrafo.style.transform = 'translateY(0)';
        }, 50);

        index++;
        setTimeout(mostrarLinea, velocidadAparicion);
      } else {
        // Mostrar mensaje final cuando termine
        mostrarMensajeFinal();
      }
    }

    function mostrarMensajeFinal() {
      // Buscar si ya existe un mensaje final en el DOM
      let mensajeFinal = document.querySelector(".mensaje-final");
      
      // Si no existe, crear uno
      if (!mensajeFinal) {
        mensajeFinal = document.createElement("div");
        mensajeFinal.className = "mensaje-final";
        mensajeFinal.textContent = "¿Aún sientes curiosidad? Continúa leyendo...";
        contenedor.appendChild(mensajeFinal);
      }
      
      // Asegurar que sea visible con animación
      mensajeFinal.style.opacity = '0';
      setTimeout(() => {
        mensajeFinal.style.transition = 'opacity 1.5s ease';
        mensajeFinal.style.opacity = '1';
      }, 100);
    }

    // Iniciar la animación de lectura
    mostrarLinea();
  });
})();