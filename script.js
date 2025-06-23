// script.js
let productos = [];
let productosMostrados = 25;

fetch('productos_djoyas.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    cargarCategorias();
    mostrarProductos(true);
  });

const contenedor = document.getElementById('contenedorProductos');
const buscador = document.getElementById('buscador');
const botonBuscar = document.getElementById('botonBuscar');
const filtroCategoria = document.getElementById('filtroCategoria');
const orden = document.getElementById('orden');

const modal = document.getElementById('modal');
const cerrarModal = document.getElementById('cerrarModal');
const modalNombre = document.getElementById('modalNombre');
const modalImagen = document.getElementById('modalImagen');
const modalSKU = document.getElementById('modalSKU');
const modalCategoria = document.getElementById('modalCategoria');
const modalResumen = document.getElementById('modalResumen');
const modalCaracteristicas = document.getElementById('modalCaracteristicas');

function mostrarProductos(esInicio = false) {
  const texto = buscador.value.toLowerCase();
  const categoria = filtroCategoria.value;
  const ordenarPor = orden.value;

  let filtrados = productos.filter(p =>
    esInicio || (p.sku && p.sku.toLowerCase().includes(texto))
  ).filter(p =>
    categoria === "" || (p.categoria && p.categoria.includes(categoria))
  );

  filtrados.sort((a, b) => {
    if (ordenarPor === "nombre") {
      return (a.nombre || "").localeCompare(b.nombre || "");
    } else {
      return a.id - b.id;
    }
  });

  contenedor.innerHTML = "";
  const limite = esInicio ? productosMostrados : filtrados.length;

  filtrados.slice(0, limite).forEach(p => {
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
  modalSKU.textContent = producto.sku || "";
  modalCategoria.textContent = producto.categoria || "";
  modalResumen.textContent = producto.resumen || "";
  modalCaracteristicas.textContent = producto.caracteristicas || "";
  modal.classList.remove('hidden');
}

cerrarModal.addEventListener("click", () => modal.classList.add('hidden'));
window.addEventListener("click", e => {
  if (e.target === modal) modal.classList.add('hidden');
});

function cargarCategorias() {
  const categorias = [...new Set(productos
    .flatMap(p => (p.categoria || "").split(",").map(c => c.trim()))
    .filter(c => c))].sort();

  filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
    categorias.map(c => `<option value="${c}">${c}</option>`).join("");
}

botonBuscar.addEventListener("click", () => mostrarProductos(false));
buscador.addEventListener("keypress", e => {
  if (e.key === "Enter") mostrarProductos(false);
});
filtroCategoria.addEventListener("change", () => mostrarProductos(false));
orden.addEventListener("change", () => mostrarProductos(false));