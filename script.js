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

    // Limpiar antes de agregar nuevas características
    modalCaracteristicas.innerHTML = "";
    modalCaracteristicas.textContent = producto.caracteristicas || "";

    const imagenURL = producto.imagen || "";
    const copyHTML = `
      <p style="position: relative;">
        <strong>Link imagen:</strong> <span style="word-break: break-all;">${imagenURL}</span>
        <button class="portapapeles" onclick="copiarURL('${imagenURL}', this)">📋</button>
        <span class="mensaje-copiado hidden">✅ Copiado</span>
      </p>
    `;
    modalCaracteristicas.insertAdjacentHTML('beforeend', copyHTML);

    modal.classList.remove('hidden');
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

    document.querySelector('#cotizaciones').classList.remove('active');
    document.querySelector('#detalleCotizacion').classList.add('active');
  });

  document.getElementById('volverHistorialBtn').addEventListener('click', () => {
    document.querySelector('#detalleCotizacion').classList.remove('active');
    document.querySelector('#cotizaciones').classList.add('active');
  });

  document.getElementById('imprimirCotizacionBtn').addEventListener('click', () => {
    window.print();
  });
});

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








// ----------------------
// CARGA DE ARCHIVO EXCEL (.xlsx)
// ----------------------

let datosPDV = [];

document.getElementById("archivoExcel").addEventListener("change", function (e) {
  const archivo = e.target.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const nombreHoja = workbook.SheetNames[0];
    const hoja = workbook.Sheets[nombreHoja];

    // Leer como array desde la hoja (sin interpretar encabezados)
    const opciones = { header: 1, defval: "" };
    const datosCrudos = XLSX.utils.sheet_to_json(hoja, opciones);

    // Fila 3 = índice 2 (encabezados), datos desde fila 4 en adelante
    const encabezados = datosCrudos[2];
    const filas = datosCrudos.slice(3);

    datosPDV = filas.map(fila => {
      const obj = {};
      encabezados.forEach((col, i) => {
        obj[col.trim()] = fila[i] || "";
      });
      return obj;
    });

    document.getElementById("archivoCargado").textContent = `Archivo cargado: ${archivo.name}`;
    console.log("Datos cargados:", datosPDV);
  };

  lector.readAsArrayBuffer(archivo);
});

// ----------------------
// BÚSQUEDA POR CÓDIGO
// ----------------------

function buscarCodigo() {
  const codigoBuscado = document.getElementById("buscadorPDV").value.trim().toLowerCase();
  const contenedor = document.getElementById("resultadoPDV");
  contenedor.innerHTML = "";

  if (!codigoBuscado || datosPDV.length === 0) return;

const producto = datosPDV.find(p => (p["Código"] || "").trim().toLowerCase() === codigoBuscado);


  if (!producto) {
    contenedor.innerHTML = "<p style='padding:10px; color:#555;'>No se encontró el producto.</p>";
    return;
  }

  const columnas = {
    "Código Producto *": "Código",
    "Modelo Producto": "Modelo",
    "PrestaShop ID": "ID Producto",
    "Nombre Producto *": "Nombre Producto",
    "Precio Tienda": "Precio Tienda Con IVA",
    "Precio PrestaShop": "Precio WEB Con IVA",
    "Material": "Material",
    "Tipo *": "CATEG. PRINCIPAL",
    "Subtipo": "SUBCATEGORIA",
    "Combinación": "Combinaciones",
    "Dimensión": "Dimensión",
    "Peso (gr)": "Peso",
    "Descripción Resumen": "Resumen",
    "Estilo": "Estilo",
    "Descripción Extensa": "Descripción",
    "Caja": "Caja",
    "Número Bolsa": "Código De Bolsa",
    "Cantidad Original": "INGRESO BODEGA",
    "Cantidad Ideal": "",
    "Cantidad Crítica": "",
    "Foto Link Individual": "URL de Producto"
  };

  const tabla = document.createElement("table");
  tabla.classList.add("tabla-pdv");

  for (const [etiqueta, campo] of Object.entries(columnas)) {
    const fila = document.createElement("tr");
    const celda1 = document.createElement("td");
    const celda2 = document.createElement("td");
    const celda3 = document.createElement("td");

    celda1.textContent = etiqueta;

    let valor = "";
    if (campo === "") valor = "";
    else valor = (producto[campo] || "").toString().trim();

    celda2.textContent = valor;

    const btnCopiar = document.createElement("button");
    btnCopiar.textContent = "Copiar";
    btnCopiar.className = "copiar-btn";
    btnCopiar.onclick = () => {
      navigator.clipboard.writeText(valor);
      btnCopiar.textContent = "Copiado!";
      setTimeout(() => btnCopiar.textContent = "Copiar", 1000);
    };

    celda3.appendChild(btnCopiar);

    fila.appendChild(celda1);
    fila.appendChild(celda2);
    fila.appendChild(celda3);
    tabla.appendChild(fila);
  }

  contenedor.appendChild(tabla);
}

function mostrarTodosLosCodigos() {
  const lista = datosPDV.map(p => p["Código"]).filter(c => c).join("\n");
  console.log("Códigos cargados:", lista);
  alert("Primeros códigos:\n" + lista.substring(0, 300));
}


// emei