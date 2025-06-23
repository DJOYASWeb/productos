// script.js
let productos = [];
let productosMostrados = 25;

fetch('productos_djoyas.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    cargarCategorias();
    mostrarInicio();
  });

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
  const imagenNombre = producto.nombre || "";
  const copyHTML = `
    <p><strong>Link imagen:</strong> <span style="word-break: break-all;">${imagenURL}</span>
    <button class="portapapeles" onclick="navigator.clipboard.writeText('${imagenURL}')" style="margin-left: 5px; cursor: pointer;">📋</button></p>
  `;
  modalCaracteristicas.insertAdjacentHTML('afterend', copyHTML);

  modal.classList.remove('hidden');
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

botonBuscar.addEventListener("click", mostrarProductos);
buscador.addEventListener("keypress", e => {
  if (e.key === "Enter") mostrarProductos();
});
filtroCategoria.addEventListener("change", mostrarProductos);
orden.addEventListener("change", mostrarProductos);
