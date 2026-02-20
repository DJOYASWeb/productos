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



if (cerrarModal && modal) {
  cerrarModal.addEventListener("click", () => modal.classList.add('hidden'));
}
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
   alert("Primeros códigos:\n" + lista.substring(0, 300));
}


// fin web

// Carga y procesamiento del archivo CSV
function procesarCSV() {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor selecciona un archivo CSV.");
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;
      const resultados = [];

      data.forEach(row => {
        const id = row['ID'] || '';
        const nombre = row['Nombre'] || '';
        const resumen = row['Resumen'] || '';

        const peso = extraerPeso(resumen);
        const tamanos = extraerTamanos(resumen);

        const tamanoPrincipal = tamanos[0] || 'N/A';
        const extradatos = tamanos.length > 1 ? 'x' : '';

        resultados.push({
          id,
          nombre,
          peso: peso || 'N/A',
          tamano: tamanoPrincipal,
          extradatos
        });
      });

      mostrarResultados(resultados);
    }
  });
}

// Función para mostrar los resultados en tabla
function mostrarResultados(data) {
  const table = document.getElementById('resultTable');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.nombre}</td>
      <td>${row.peso}</td>
      <td>${row.tamano}</td>
      <td>${row.extradatos}</td>
    `;
    tbody.appendChild(tr);
  });

  table.style.display = 'table';
  window.resultadosProcesados = data; // Guardar para exportar
}

// Exporta los datos procesados a un nuevo archivo CSV
function exportarCSV() {
  if (!window.resultadosProcesados || window.resultadosProcesados.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const encabezados = "ID,Nombre,Peso,Tamaño,Extradatos\n";
  const filas = window.resultadosProcesados.map(row =>
    `"${row.id}","${row.nombre}","${row.peso}","${row.tamano}","${row.extradatos}"`
  ).join("\n");

  const blob = new Blob([encabezados + filas], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "productos_procesados.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Extrae el valor de peso desde el resumen
function extraerPeso(texto) {
  if (!texto || typeof texto !== 'string') return null;

  // Acepta: "Peso 14.5 grs", "14.5 grs", "14,5 g"
  const match = texto.match(/(?:Peso\s*)?([\d.,]+)\s*(grs?|g)/i);
  return match ? match[1] + ' grs' : null;
}

// Extrae todos los tamaños (cm y mm) desde el resumen
function extraerTamanos(texto) {
  if (!texto || typeof texto !== 'string') return [];

  const medidas = [];

  // Buscar medidas en cm
  const matchesCM = [...texto.matchAll(/([\d.,]+)\s*cm/gi)];
  matchesCM.forEach(m => medidas.push(m[1] + ' cm'));

  // Buscar medidas en mm
  const matchesMM = [...texto.matchAll(/([\d.,]+)\s*mm/gi)];
  matchesMM.forEach(m => medidas.push(m[1] + ' mm'));

  return medidas;
}


function ajustarPunto() {
  if (!window.resultadosProcesados || window.resultadosProcesados.length === 0) {
    alert("Primero debes procesar un archivo CSV.");
    return;
  }

  // Reemplazar comas por puntos en peso y tamaño
  window.resultadosProcesados = window.resultadosProcesados.map(row => {
    const pesoAjustado = row.peso ? row.peso.replace(/,/g, '.') : row.peso;
    const tamanoAjustado = row.tamano ? row.tamano.replace(/,/g, '.') : row.tamano;

    return {
      ...row,
      peso: pesoAjustado,
      tamano: tamanoAjustado
    };
  });

  // Volver a mostrar resultados con los cambios
  mostrarResultados(window.resultadosProcesados);
}





// ========== MODAL PERSONALIZADO: PLANILLA ==========
const modalColumnas = document.getElementById("modalColumnas");
const botonProcesar = document.getElementById("botonProcesar");
const cerrarModalColumnas = document.getElementById("cerrarModalColumnas");
const cancelarExportar = document.getElementById("cancelarExportar");
const confirmarExportar = document.getElementById("confirmarExportar");

if (botonProcesar && modalColumnas) {
  botonProcesar.addEventListener("click", () => {
    modalColumnas.classList.remove("hidden");
  });
}

[cerrarModalColumnas, cancelarExportar].forEach(boton => {
  if (boton) {
    boton.addEventListener("click", () => {
      modalColumnas.classList.add("hidden");
    });
  }
});

if (confirmarExportar) {
  confirmarExportar.addEventListener("click", () => {
    modalColumnas.classList.add("hidden");
    // Aquí llamás a tu función de exportación
    exportarPlanillaAExcel(); // reemplazá con tu función real si se llama diferente
  });
}





let datosFidelizacion = [];

// 1. Cargar los datos al iniciar la página
async function cargarDatosFidelizacion() {
    try {
        const response = await fetch('assets/data/Fidelizacion - enero 2025-2026.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        datosFidelizacion = XLSX.utils.sheet_to_json(firstSheet);
        console.log("Base de datos de clientas cargada");
    } catch (error) {
        console.error("Error al cargar el archivo de clientas:", error);
    }
}



// Event Listeners
document.getElementById('btnBuscarCliente').addEventListener('click', buscarCliente);
document.addEventListener('DOMContentLoaded', cargarDatosFidelizacion);


// Variable para guardar la clienta que se buscó
let clientaActual = null;




// Función para el botón Copiar
function copiarAlPortapapeles() {
    const texto = document.getElementById('textoMensaje');
    texto.select();
    texto.setSelectionRange(0, 99999); // Para móviles

    navigator.clipboard.writeText(texto.value).then(() => {
        const btn = document.getElementById('btnCopiarTexto');
        const originalText = btn.innerText;
        btn.innerText = "✅ ¡Copiado!";
        btn.style.backgroundColor = "#28a745";

        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "#007bff";
        }, 2000);
    });
}

// No olvides registrar el evento en tu DOMContentLoaded
document.getElementById('btnCopiarTexto').addEventListener('click', copiarAlPortapapeles);



// 1. Función de Búsqueda (Solo muestra los datos del RUT)
function buscarCliente() {
    const termino = document.getElementById('inputBusquedaCliente').value.toLowerCase().trim();
    const contenedorRaiz = document.getElementById('resultadoCliente');
    const contenedorInfo = document.getElementById('infoDetalladaCliente');
    const areaMensaje = document.getElementById('areaMensaje');

    if (!termino) return;

    clientaActual = datosFidelizacion.find(c => 
        String(c.Rut).toLowerCase().includes(termino) ||
        String(c.Email).toLowerCase().includes(termino)
    );

    if (clientaActual) {
        contenedorRaiz.classList.remove('hidden');
        areaMensaje.classList.add('hidden'); // Mantenemos el mensaje oculto al buscar
        
        const montoFormateado = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(clientaActual['Total monto'] || 0);

        contenedorInfo.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>Información de Contacto</h4>
                    <p><strong>Nombre:</strong> ${clientaActual.Nombre} ${clientaActual.Apellido}</p>
                    <p><strong>RUT:</strong> ${clientaActual.Rut}</p>
                    <p><strong>Correo:</strong> <span style="color: #007bff;">${clientaActual.Email}</span></p>
                </div>
                <div>
                    <h4>Resumen de Ventas</h4>
                    <p><strong>Cantidad de Compras:</strong> ${clientaActual['Total cant'] || 0}</p>
                    <p><strong>Monto Total Comprado:</strong> <span style="font-weight: bold; color: #28a745;">${montoFormateado}</span></p>
                    <p><strong>Categoría:</strong> ${clientaActual['Prog Fidelización']}</p>
                </div>
            </div>
        `;
    } else {
        alert("Clienta no encontrada");
        contenedorRaiz.classList.add('hidden');
        clientaActual = null;
    }
}

function generarTextoEnPantalla() {
    if (!clientaActual) {
        alert("Primero debes buscar una clienta");
        return;
    }

    const nombre = clientaActual.Nombre || "Clienta";
    const categoriaRaw = clientaActual['Prog Fidelización'] || "";
    const compras = parseInt(clientaActual['Total cant']) || 0;
    const montoTotal = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(clientaActual['Total monto'] || 0);
    
    let categoriaConEmoji = "";
    let beneficios = "";
    const cat = categoriaRaw.toLowerCase();

    // Lógica de Mensaje y Beneficios
    if (cat.includes("diamante")) {
        categoriaConEmoji = "Diamante 💎";
        beneficios = "✅ 10% DCTO fijo menos $400.000\n✅ 12% DCTO sobre $400.000\n✅ 15% DCTO sobre $800.000\n✅ 20% DCTO sobre $1.200.000\n✅ 24% DCTO sobre $3.000.000\n✅ Acceso a catalogodejoyas.cl\n✅ Ofertas web anticipadas\n✅ Regalo de Navidad anual";
    } else if (cat.includes("oro")) {
        categoriaConEmoji = "Oro 🟡";
        beneficios = "✅ 5% DCTO menos $400.000\n✅ 7% DCTO sobre $400.000\n✅ 12% DCTO sobre $800.000\n✅ 15% DCTO sobre $1.200.000\n✅ 20% DCTO sobre $1.600.000\n✅ Acceso a catalogodejoyas.cl\n✅ Ofertas web anticipadas\n✅ Regalo de Navidad anual";
    } else if (cat.includes("plata")) {
        categoriaConEmoji = "Plata ⚪";
        beneficios = "✅ 7% DCTO sobre $400.000\n✅ 12% DCTO sobre $800.000\n✅ 15% DCTO sobre $1.200.000\n✅ 20% DCTO sobre $1.600.000\n✅ Ofertas web anticipadas\n✅ Acceso a catalogodejoyas.cl";
    } else if (cat.includes("bronce")) {
        categoriaConEmoji = "Bronce 🟤";
        beneficios = "✅ 7% DCTO sobre $400.000\n✅ 12% DCTO sobre $800.000\n✅ 15% DCTO sobre $1.200.000\n✅ Ofertas web anticipadas\n✅ Acceso a catalogodejoyas.cl";
    } else if (compras <= 3) {
        // CASO ESPECIAL: 3 O MENOS COMPRAS / SIN GRUPO
        const comprasFaltantes = 4 - compras;
        categoriaConEmoji = "Sin grupo asignado";
        beneficios = `❌ Aún no cuentas con beneficios de grupo.\n🚀 ¡Te faltan solo ${comprasFaltantes} compras para llegar al nivel *Bronce* y desbloquear descuentos exclusivos!`;
    } else {
        categoriaConEmoji = "General";
        beneficios = "✅ Consulta tus beneficios vigentes en tienda.";
    }

    // Ajuste de texto para compras
    const textoCompras = compras > 0 
        ? `📈 Realizaste ${compras} compras por un total de ${montoTotal}.`
        : `⚠️ No registras compras en el periodo indicado.`;

    const mensaje = `${nombre}, actualmente no perteneces a ningún grupo de fidelización.

Correspondiente al período de compras desde el 10/01/2025 al 10/01/2026.

${textoCompras}

*Estatus:*
${beneficios}

¡Te invitamos a seguir comprando en DJOYAS! ✨`;

    // Si tiene grupo, usamos el formato anterior, si no, el de "no perteneces"
    const mensajeFinal = (compras <= 3 && !cat.includes("bronce") && !cat.includes("plata") && !cat.includes("oro") && !cat.includes("diamante"))
        ? mensaje 
        : `${nombre} perteneces al grupo *"${categoriaConEmoji}"*\n\nCorrespondiente al período de compras desde el 10/01/2025 al 10/01/2026.\n\n${textoCompras}\n\n*Beneficios grupo ${categoriaConEmoji}:*\n${beneficios}\n\n¡Gracias por preferir DJOYAS! ✨`;

    document.getElementById('textoMensaje').value = mensajeFinal;
    document.getElementById('areaMensaje').classList.remove('hidden');
}


// 3. Registro de eventos (dentro de tu DOMContentLoaded)
document.getElementById('btnBuscarCliente').addEventListener('click', buscarCliente);
document.getElementById('btnGenerarWSP').addEventListener('click', generarTextoEnPantalla);
document.getElementById('btnCopiarTexto').addEventListener('click', copiarAlPortapapeles);



//v2