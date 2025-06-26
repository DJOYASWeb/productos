document.addEventListener('DOMContentLoaded', () => {
  let productos = [];
  let productosMostrados = 25;
  let cotizaciones = [];
  let productosSeleccionados = [];

  // Elementos generales
  const contenedor = document.getElementById('contenedorProductos');
  const buscador = document.getElementById('buscador');
  const botonBuscar = document.getElementById('botonBuscar');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const orden = document.getElementById('orden');

  // Modal
  const modal = document.getElementById('modal');
  const cerrarModal = document.getElementById('cerrarModal');
  const modalNombre = document.getElementById('modalNombre');
  const modalID = document.getElementById('modalID');
  const modalImagen = document.getElementById('modalImagen');
  const modalSKU = document.getElementById('modalSKU');
  const modalCategoria = document.getElementById('modalCategoria');
  const modalResumen = document.getElementById('modalResumen');
  const modalCaracteristicas = document.getElementById('modalCaracteristicas');

  // Cotización
  const clienteInput = document.getElementById('cliente');
  const correoInput = document.getElementById('correo');
  const busquedaNombre = document.getElementById('busquedaNombre');
  const busquedaSKU = document.getElementById('busquedaSKU');
  const cantidadInput = document.getElementById('cantidadProducto');
  const listaProductosCotizacion = document.getElementById('listaProductosCotizacion');
  const totalCotizacionSpan = document.getElementById('totalCotizacion');
  const guardarCotizacionBtn = document.getElementById('guardarCotizacionBtn');
  const tablaCotizacionesBody = document.querySelector('#tablaCotizaciones tbody');
  const nuevaCotizacionBtn = document.getElementById('nuevaCotizacionBtn');
  const volverBtn = document.getElementById('volverBtn');
  const cotizacionFormDiv = document.getElementById('formCotizacion');
  const tablaCotizaciones = document.getElementById('tablaCotizaciones');

  // === Cargar productos ===
  fetch('productos_djoyas.json')
    .then(res => res.json())
    .then(data => {
      productos = data;
      cargarCategorias();
      mostrarInicio();
    });

  function mostrarInicio() {
    const primeros = productos.slice(0, productosMostrados);
    contenedor.innerHTML = "";
    primeros.forEach(p => crearCardProducto(p));
  }

  function crearCardProducto(p) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre || 'Sin nombre'}">
      <h3>${p.nombre || 'Producto sin nombre'}</h3>
      <p>${p.categoria || ""}</p>
    `;
    div.addEventListener('click', () => mostrarModal(p));
    contenedor.appendChild(div);
  }

  function mostrarProductos() {
    const texto = buscador.value.toLowerCase();
    const categoria = filtroCategoria.value;
    const ordenarPor = orden.value;

    let filtrados = productos.filter(p =>
      p.sku && p.sku.toLowerCase().includes(texto) &&
      (categoria === "" || (p.categoria && p.categoria.includes(categoria)))
    );

    filtrados.sort((a, b) =>
      (ordenarPor === "nombre")
        ? (a.nombre || "").localeCompare(b.nombre || "")
        : a.id - b.id
    );

    contenedor.innerHTML = "";
    filtrados.forEach(p => crearCardProducto(p));
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
        <button class="portapapeles" onclick="copiarURL('${imagenURL}', this)">📋</button>
        <span class="mensaje-copiado hidden">✅ Copiado</span>
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

  cerrarModal.addEventListener("click", () => modal.classList.add('hidden'));
  window.addEventListener("click", e => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  function cargarCategorias() {
    const categorias = [...new Set(productos.flatMap(p => (p.categoria || "").split(",").map(c => c.trim())))].sort();
    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
      categorias.map(c => `<option value="${c}">${c}</option>`).join("");
  }

  // === Eventos generales ===
  botonBuscar?.addEventListener("click", mostrarProductos);
  buscador?.addEventListener("keypress", e => {
    if (e.key === "Enter") mostrarProductos();
  });
  filtroCategoria?.addEventListener("change", mostrarProductos);
  orden?.addEventListener("change", mostrarProductos);

  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-section').forEach(section => section.classList.remove('active'));
      document.getElementById(button.getAttribute('data-tab'))?.classList.add('active');
    });
  });

  // === Cotización ===

  nuevaCotizacionBtn.addEventListener('click', () => {
    cotizacionFormDiv.classList.remove('hidden');
    tablaCotizaciones.classList.add('hidden');
    nuevaCotizacionBtn.classList.add('hidden');
    volverBtn.classList.remove('hidden');
  });

  volverBtn.addEventListener('click', () => {
    cotizacionFormDiv.classList.add('hidden');
    tablaCotizaciones.classList.remove('hidden');
    nuevaCotizacionBtn.classList.remove('hidden');
    volverBtn.classList.add('hidden');
  });

  document.getElementById('agregarProductoBtn').addEventListener('click', () => {
    const nombre = busquedaNombre.value.trim().toLowerCase();
    const sku = busquedaSKU.value.trim().toLowerCase();
    const cantidad = parseInt(cantidadInput.value, 10);

    if ((!nombre && !sku) || isNaN(cantidad) || cantidad <= 0) return alert("Datos inválidos");

    const producto = productos.find(p =>
      (nombre && p.nombre?.toLowerCase().includes(nombre)) ||
      (sku && p.sku?.toLowerCase().includes(sku))
    );

    if (!producto) return alert("Producto no encontrado");

    if (productosSeleccionados.find(p => p.sku === producto.sku)) {
      return alert("Producto ya agregado.");
    }

    productosSeleccionados.push({
      nombre: producto.nombre,
      sku: producto.sku,
      precio: parseFloat(producto.precio),
      cantidad,
      total: parseFloat(producto.precio) * cantidad
    });

    actualizarVistaProductos();
  });

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

  listaProductosCotizacion.addEventListener('click', e => {
    if (e.target.classList.contains('eliminar-producto')) {
      const index = e.target.dataset.index;
      productosSeleccionados.splice(index, 1);
      actualizarVistaProductos();
    }
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

  function calcularTotal() {
    const total = productosSeleccionados.reduce((sum, p) => sum + p.total, 0);
    totalCotizacionSpan.textContent = total.toFixed(0);
  }

  guardarCotizacionBtn.addEventListener('click', () => {
    const cliente = clienteInput.value.trim();
    const correo = correoInput.value.trim();
    const fecha = new Date().toLocaleDateString();
    const total = productosSeleccionados.reduce((sum, p) => sum + p.total, 0);

    if (!cliente || !correo || productosSeleccionados.length === 0) {
      alert("Completa todos los campos y agrega al menos un producto.");
      return;
    }

cotizaciones.push({
  cliente,
  correo,
  fecha,
  total,
  productos: [...productosSeleccionados]
});

    clienteInput.value = "";
    correoInput.value = "";
    busquedaNombre.value = "";
    busquedaSKU.value = "";
    productosSeleccionados = [];
    actualizarVistaProductos();

    cotizacionFormDiv.classList.add('hidden');
    tablaCotizaciones.classList.remove('hidden');
    nuevaCotizacionBtn.classList.remove('hidden');
    volverBtn.classList.add('hidden');

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

// Mostrar detalle al hacer clic en una fila
tablaCotizacionesBody.addEventListener('click', (e) => {
  const fila = e.target.closest('tr');
  if (!fila) return;

  const index = Array.from(tablaCotizacionesBody.children).indexOf(fila);
  const cot = cotizaciones[index];

  document.getElementById('detalleCliente').textContent = cot.cliente;
  document.getElementById('detalleCorreo').textContent = cot.correo;
  document.getElementById('detalleFecha').textContent = cot.fecha;
  document.getElementById('detalleTotal').textContent = cot.total.toFixed(0);

  const ul = document.getElementById('detalleProductos');
  ul.innerHTML = "";

  cot.productos.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.nombre}</strong> (SKU: ${p.sku}) - Cantidad: ${p.cantidad} | Unitario: $${p.precio} | Total: $${(p.total).toFixed(0)}`;
    ul.appendChild(li);
  });

  document.getElementById('detalleCotizacion').classList.remove('hidden');
});


// Mostrar detalle de cotización
tablaCotizacionesBody.addEventListener('click', (e) => {
  const fila = e.target.closest('tr');
  if (!fila) return;

  const index = Array.from(tablaCotizacionesBody.children).indexOf(fila);
  const cot = cotizaciones[index];

  document.getElementById('detalleCliente').textContent = cot.cliente;
  document.getElementById('detalleCorreo').textContent = cot.correo;
  document.getElementById('detalleFecha').textContent = cot.fecha;
  document.getElementById('detalleTotal').textContent = cot.total.toFixed(0);

  const ul = document.getElementById('detalleProductos');
  ul.innerHTML = "";
  cot.productos.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.nombre}</strong> (SKU: ${p.sku})<br>
      Cantidad: ${p.cantidad} | Unitario: $${p.precio} | Total: $${(p.total).toFixed(0)}
    `;
    ul.appendChild(li);
  });

  // Mostrar pantalla de detalle, ocultar historial
  document.querySelector('#cotizaciones').classList.remove('active');
  document.querySelector('#detalleCotizacion').classList.add('active');
});

// Botón volver
document.getElementById('volverHistorialBtn').addEventListener('click', () => {
  document.querySelector('#detalleCotizacion').classList.remove('active');
  document.querySelector('#cotizaciones').classList.add('active');
});

// Imprimir cotización
document.getElementById('imprimirCotizacionBtn').addEventListener('click', () => {
  window.print();
});






});
