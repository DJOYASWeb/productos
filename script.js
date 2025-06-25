document.addEventListener('DOMContentLoaded', () => {
  let productos = [];
  let productosMostrados = 25;

  const contenedor = document.getElementById('contenedorProductos');
  const buscador = document.getElementById('buscador');
  const botonBuscar = document.getElementById('botonBuscar');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const orden = document.getElementById('orden');

  const modal = document.getElementById('modal');
  const cerrarModal = document.getElementById('cerrarModal');
  const modalNombre = document.getElementById('modalNombre');
  const modalID = document.getElementById('modalID');
  const modalImagen = document.getElementById('modalImagen');
  const modalSKU = document.getElementById('modalSKU');
  const modalCategoria = document.getElementById('modalCategoria');
  const modalResumen = document.getElementById('modalResumen');
  const modalCaracteristicas = document.getElementById('modalCaracteristicas');

  // Cargar productos
  fetch('productos_djoyas.json')
    .then(response => response.json())
    .then(data => {
      productos = data;
      cargarCategorias();
      mostrarInicio();
    })
    .catch(error => console.error("Error cargando productos:", error));

  function mostrarInicio() {
    const primeros = productos.slice(0, productosMostrados);
    contenedor.innerHTML = "";
    primeros.forEach(p => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre || 'Sin nombre'}">
        <h3>${p.nombre || 'Producto sin nombre'}</h3>
        <p>${p.categoria || ""}</p>
      `;
      div.addEventListener('click', () => mostrarModal(p));
      contenedor.appendChild(div);
    });
  }

  function mostrarProductos() {
    const texto = buscador.value.toLowerCase();
    const categoria = filtroCategoria.value;
    const ordenarPor = orden.value;

    let filtrados = productos.filter(p =>
      p.sku && p.sku.toLowerCase().includes(texto) &&
      (categoria === "" || (p.categoria && p.categoria.includes(categoria)))
    );

    filtrados.sort((a, b) => {
      if (ordenarPor === "nombre") {
        return (a.nombre || "").localeCompare(b.nombre || "");
      } else {
        return a.id - b.id;
      }
    });

    contenedor.innerHTML = "";
    filtrados.forEach(p => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre || 'Sin nombre'}">
        <h3>${p.nombre || 'Producto sin nombre'}</h3>
        <p>${p.categoria || ""}</p>
      `;
      div.addEventListener('click', () => mostrarModal(p));
      contenedor.appendChild(div);
    });
  }

  function mostrarModal(producto) {
    modalNombre.textContent = producto.nombre || "";
    modalImagen.src = producto.imagen || "";
    modalImagen.alt = producto.nombre || "";
    modalID.textContent = producto.id || "";
    modalSKU.textContent = producto.sku || "";
    modalCategoria.textContent = producto.categoria || "";
    modalResumen.textContent = producto.resumen || "";
    modalCaracteristicas.textContent = producto.caracteristicas || "";

    const imagenURL = producto.imagen || "";
    const copyHTML = `
      <p style="position: relative;">
        <strong>Link imagen:</strong> <span style="word-break: break-all;">${imagenURL}</span>
        <button class="portapapeles" onclick="copiarURL('${imagenURL}', this)" style="margin-left: 5px; cursor: pointer;">📋</button>
        <span class="mensaje-copiado hidden" style="position: absolute; top: 40%; background: #cbffd4; padding:0.25rem 1rem; border-radius: 4px; font-size: 0.8em;">✅ Copiado</span>
      </p>
    `;
    modalCaracteristicas.insertAdjacentHTML('afterend', copyHTML);

    modal.classList.remove('hidden');
  }

  function copiarURL(texto, boton) {
    navigator.clipboard.writeText(texto).then(() => {
      const mensaje = boton.nextElementSibling;
      mensaje.classList.remove('hidden');
      mensaje.classList.add('visible');

      setTimeout(() => {
        mensaje.classList.remove('visible');
        mensaje.classList.add('hidden');
      }, 1500);
    });
  }

  cerrarModal.addEventListener("click", () => {
    modal.classList.add('hidden');
    const extra = document.querySelector('p strong + span + button')?.parentElement;
    if (extra) extra.remove();
  });

  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      const extra = document.querySelector('p strong + span + button')?.parentElement;
      if (extra) extra.remove();
    }
  });

  function cargarCategorias() {
    const categorias = [...new Set(productos
      .flatMap(p => (p.categoria || "").split(",").map(c => c.trim()))
      .filter(c => c))].sort();

    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
      categorias.map(c => `<option value="${c}">${c}</option>`).join("");
  }

  // Eventos de búsqueda y filtrado
  botonBuscar?.addEventListener("click", mostrarProductos);
  buscador?.addEventListener("keypress", e => {
    if (e.key === "Enter") mostrarProductos();
  });
  filtroCategoria?.addEventListener("change", mostrarProductos);
  orden?.addEventListener("change", mostrarProductos);

  // Control de pestañas
  const buttons = document.querySelectorAll('.tab-button');
  const sections = document.querySelectorAll('.tab-section');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-tab');

      sections.forEach(section => section.classList.remove('active'));
      const selectedSection = document.getElementById(target);
      if (selectedSection) selectedSection.classList.add('active');
    });
  });
});
