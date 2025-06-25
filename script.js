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

// === Cotizaciones ===
const cotizacionFormDiv = document.getElementById('formCotizacion');
const cotizacionForm = document.getElementById('cotizacionForm');
const nuevaCotizacionBtn = document.getElementById('nuevaCotizacionBtn');
const productoSelect = document.getElementById('productoSelect');
const cantidadInput = document.getElementById('cantidad');
const precioTotalSpan = document.getElementById('precioTotal');
const tablaCotizacionesBody = document.querySelector('#tablaCotizaciones tbody');
const volverBtn = document.getElementById('volverBtn');
const tablaCotizaciones = document.getElementById('tablaCotizaciones');



// Mostrar formulario y ocultar tabla
nuevaCotizacionBtn.addEventListener('click', () => {
  cotizacionFormDiv.classList.remove('hidden');
  tablaCotizaciones.classList.add('hidden');
  nuevaCotizacionBtn.classList.add('hidden');
  volverBtn.classList.remove('hidden');
});

// Volver al historial
volverBtn.addEventListener('click', () => {
  cotizacionFormDiv.classList.add('hidden');
  tablaCotizaciones.classList.remove('hidden');
  nuevaCotizacionBtn.classList.remove('hidden');
  volverBtn.classList.add('hidden');
});

// Actualizar total al cambiar producto o cantidad
function actualizarPrecioTotal() {
  const productoId = productoSelect.value;
  const cantidad = parseInt(cantidadInput.value, 10);

  const producto = productos.find(p => p.id == productoId);
  if (producto && producto.precio) {
    const total = parseFloat(producto.precio) * cantidad;
    precioTotalSpan.textContent = total.toFixed(2);
  } else {
    precioTotalSpan.textContent = "0";
  }
}

// productoSelect.addEventListener('change', actualizarPrecioTotal);
cantidadInput.addEventListener('input', actualizarPrecioTotal);

// Guardar cotización
cotizacionForm.addEventListener('submit', e => {
  e.preventDefault();

  const productoId = productoSelect.value;
  const cantidad = parseInt(cantidadInput.value, 10);
  const producto = productos.find(p => p.id == productoId);

  if (!producto || isNaN(cantidad) || cantidad <= 0) {
    alert("Datos inválidos");
    return;
  }

  const total = parseFloat(producto.precio) * cantidad;

  cotizaciones.push({
    nombre: producto.nombre,
    cantidad,
    total: total.toFixed(2)
  });

  cotizacionForm.reset();
  precioTotalSpan.textContent = "0";
  cotizacionFormDiv.classList.add('hidden');

  renderizarCotizaciones();
});

// Mostrar cotizaciones en tabla
function renderizarCotizaciones() {
  tablaCotizacionesBody.innerHTML = "";
  cotizaciones.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.nombre}</td>
      <td>${c.cantidad}</td>
      <td>$${c.total}</td>
    `;
    tablaCotizacionesBody.appendChild(tr);
  });
}

// Cargar productos al dropdown
function cargarProductosEnCotizador() {
  if (!productoSelect) return;

  productoSelect.innerHTML = productos.map(p =>
    `<option value="${p.id}">${p.nombre} - $${p.precio}</option>`
  ).join("");

  actualizarPrecioTotal(); // Calcular precio al cargar
}

// Llamar cuando se carguen los productos
fetch('productos_djoyas.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    cargarCategorias();
    mostrarInicio();
    cargarProductosEnCotizador(); // Aquí
  });


let cotizaciones = [];
let productosSeleccionados = [];

const clienteInput = document.getElementById('cliente');
const correoInput = document.getElementById('correo');
const busquedaNombre = document.getElementById('busquedaNombre');
const busquedaSKU = document.getElementById('busquedaSKU');
const cantidadInput = document.getElementById('cantidadProducto');
const listaProductosCotizacion = document.getElementById('listaProductosCotizacion');
const totalCotizacionSpan = document.getElementById('totalCotizacion');
const guardarCotizacionBtn = document.getElementById('guardarCotizacionBtn');
const tablaCotizacionesBody = document.querySelector('#tablaCotizaciones tbody');

// Botón Agregar Producto
document.getElementById('agregarProductoBtn').addEventListener('click', () => {
  const nombre = busquedaNombre.value.trim().toLowerCase();
  const sku = busquedaSKU.value.trim().toLowerCase();
  const cantidad = parseInt(cantidadInput.value, 10);

  if (!nombre && !sku) return alert("Debes buscar por nombre o SKU");
  if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");

  const producto = productos.find(p =>
    (nombre && p.nombre?.toLowerCase().includes(nombre)) ||
    (sku && p.sku?.toLowerCase().includes(sku))
  );

  if (!producto) return alert("Producto no encontrado");

  const yaExiste = productosSeleccionados.find(p => p.sku === producto.sku);
  if (yaExiste) return alert("Ya agregaste este producto");

  const total = parseFloat(producto.precio) * cantidad;

  productosSeleccionados.push({
    nombre: producto.nombre,
    sku: producto.sku,
    precio: parseFloat(producto.precio),
    cantidad,
    total
  });

  actualizarVistaProductos();
});

function actualizarVistaProductos() {
  listaProductosCotizacion.innerHTML = "";

  productosSeleccionados.forEach((p, index) => {
    const div = document.createElement('div');
    div.className = "preview-producto";
    div.innerHTML = `
      <strong>${p.nombre}</strong> (SKU: ${p.sku})<br>
      Cantidad: <input type="number" min="1" value="${p.cantidad}" data-index="${index}" class="editar-cantidad" />
      | Unitario: $${p.precio} | Total: $${(p.precio * p.cantidad).toFixed(0)}
      <button data-index="${index}" class="eliminar-producto">❌</button>
    `;
    listaProductosCotizacion.appendChild(div);
  });

  calcularTotal();
}

// Editar cantidad
listaProductosCotizacion.addEventListener('input', e => {
  if (e.target.classList.contains('editar-cantidad')) {
    const index = e.target.dataset.index;
    const nuevaCantidad = parseInt(e.target.value, 10);
    if (nuevaCantidad > 0) {
      productosSeleccionados[index].cantidad = nuevaCantidad;
      productosSeleccionados[index].total = productosSeleccionados[index].precio * nuevaCantidad;
      actualizarVistaProductos();
    }
  }
});

// Eliminar producto
listaProductosCotizacion.addEventListener('click', e => {
  if (e.target.classList.contains('eliminar-producto')) {
    const index = e.target.dataset.index;
    productosSeleccionados.splice(index, 1);
    actualizarVistaProductos();
  }
});

function calcularTotal() {
  const total = productosSeleccionados.reduce((sum, p) => sum + p.total, 0);
  totalCotizacionSpan.textContent = total.toFixed(0);
}

// Guardar cotización
guardarCotizacionBtn.addEventListener('click', () => {
  const cliente = clienteInput.value.trim();
  const correo = correoInput.value.trim();
  const fecha = new Date().toLocaleDateString();
  const total = productosSeleccionados.reduce((sum, p) => sum + p.total, 0);

  if (!cliente || !correo || productosSeleccionados.length === 0) {
    alert("Completa todos los campos y agrega al menos un producto.");
    return;
  }

  cotizaciones.push({ cliente, correo, fecha, total });

  clienteInput.value = "";
  correoInput.value = "";
  busquedaNombre.value = "";
  busquedaSKU.value = "";
  productosSeleccionados = [];
  actualizarVistaProductos();

  document.getElementById('formCotizacion').classList.add('hidden');
  document.getElementById('tablaCotizaciones').classList.remove('hidden');
  document.getElementById('nuevaCotizacionBtn').classList.remove('hidden');
  document.getElementById('volverBtn').classList.add('hidden');

  renderizarCotizaciones();
});

function renderizarCotizaciones() {
  tablaCotizacionesBody.innerHTML = "";
  cotizaciones.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.cliente}</td>
      <td>${c.correo}</td>
      <td>${c.fecha}</td>
      <td>$${c.total.toFixed(0)}</td>
    `;
    tablaCotizacionesBody.appendChild(tr);
  });
}










});
