let productos = [];

fetch('productos_djoyas.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    cargarCategorias();
    mostrarProductos();
  });

const contenedor = document.getElementById('contenedorProductos');
const buscador = document.getElementById('buscador');
const filtroCategoria = document.getElementById('filtroCategoria');
const orden = document.getElementById('orden');

function mostrarProductos() {
  const texto = buscador.value.toLowerCase();
  const categoria = filtroCategoria.value;
  const ordenarPor = orden.value;

  let filtrados = productos.filter(p => 
    (p.nombre.toLowerCase().includes(texto) ||
     (p.caracteristicas && p.caracteristicas.toLowerCase().includes(texto)) ||
     (p.resumen && p.resumen.toLowerCase().includes(texto))) &&
    (categoria === "" || p.categoria?.includes(categoria))
  );

  filtrados.sort((a, b) => {
    if (ordenarPor === "nombre") {
      return a.nombre.localeCompare(b.nombre);
    } else {
      return a.id - b.id;
    }
  });

  contenedor.innerHTML = "";
  filtrados.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${p.categoria || ""}</p>
    `;
    contenedor.appendChild(div);
  });
}

function cargarCategorias() {
  const categorias = [...new Set(productos.flatMap(p => (p.categoria || "").split(",").map(c => c.trim())))].sort();
  filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
    categorias.map(c => `<option value="${c}">${c}</option>`).join("");
}

buscador.addEventListener("input", mostrarProductos);
filtroCategoria.addEventListener("change", mostrarProductos);
orden.addEventListener("change", mostrarProductos);
