// Modo estricto: el navegador avisa más errores
"use strict";


/* =====================================================================
   1. Datos y referencias a los elementos de la página
   ===================================================================== */

// Valores fijos. Van en MAYÚSCULAS porque nunca cambian
const LIMITE_STOCK_BAJO = 10;
const MULTIPLO_COSTO = 50;
const IMAGEN_POR_DEFECTO = "img/generico.svg";

// Categorías que se muestran en la barra lateral y en el formulario
const CATEGORIAS = ["Telas", "Hilos", "Botones y cierres", "Empaques"];

// Lista de insumos del taller. Cada insumo es un objeto con sus datos
const insumos = [
  {
    id: 1, nombre: "Tela de algodón (metro)", costo: 18500,
    categoria: "Telas", cantidad: 40, imagen: "img/tela-algodon.svg"
  },
  {
    id: 2, nombre: "Tela jean índigo (metro)", costo: 24000,
    categoria: "Telas", cantidad: 6, imagen: "img/tela-jean.svg"
  },
  {
    id: 3, nombre: "Hilo poliéster (cono)", costo: 7500,
    categoria: "Hilos", cantidad: 25, imagen: "img/hilo-poliester.svg"
  },
  {
    id: 4, nombre: "Botones de pasta (bolsa x100)", costo: 12000,
    categoria: "Botones y cierres", cantidad: 0, imagen: "img/botones-pasta.svg"
  },
  {
    id: 5, nombre: "Cierre metálico 20 cm", costo: 1800,
    categoria: "Botones y cierres", cantidad: 120, imagen: "img/cierre-metalico.svg"
  },
  {
    id: 6, nombre: "Bolsa de empaque kraft", costo: 950,
    categoria: "Empaques", cantidad: 300, imagen: "img/bolsa-kraft.svg"
  }
];

// Cuentas creadas desde el formulario de contacto
const usuarios = [];

// Valores que cambian mientras se usa la página, por eso van con let
let categoriaActual = "Todas";
let siguienteId = insumos.length + 1;

// Elementos del formulario para agregar insumos
const formInsumo = document.querySelector("#formInsumo");
const campoNombre = document.querySelector("#insumoNombre");
const campoCosto = document.querySelector("#insumoCosto");
const campoCantidad = document.querySelector("#insumoCantidad");
const campoCategoria = document.querySelector("#insumoCategoria");
const mensajeInsumo = document.querySelector("#mensajeInsumo");

// Elementos del buscador, las tarjetas y la tabla
const buscador = document.querySelector("#buscador");
const contador = document.querySelector("#contador");
const listaInsumos = document.querySelector("#listaInsumos");
const cuerpoInventario = document.querySelector("#cuerpoInventario");

// Elementos de la barra lateral
const listaFiltros = document.querySelector("#listaFiltros");
const resumenTotal = document.querySelector("#resumenTotal");
const resumenAgotados = document.querySelector("#resumenAgotados");
const resumenUnidades = document.querySelector("#resumenUnidades");
const resumenValor = document.querySelector("#resumenValor");

// Elementos del formulario de contacto
const formContacto = document.querySelector("#formContacto");
const contactoNombre = document.querySelector("#contactoNombre");
const contactoCorreo = document.querySelector("#contactoCorreo");
const contactoTelefono = document.querySelector("#contactoTelefono");
const contactoPago = document.querySelector("#contactoPago");
const mensajeContacto = document.querySelector("#mensajeContacto");
const cuerpoUsuarios = document.querySelector("#cuerpoUsuarios");


/* =====================================================================
   2. Funciones de ayuda (Contacto y validación)
   ===================================================================== */

// Convierte un número en pesos colombianos: 18500 → $ 18.500
function formatearPesos(valor) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });
}

// Devuelve el estado de un insumo según cuántas unidades quedan
function obtenerEstado(cantidad) {
  if (cantidad === 0) {
    return "Agotado";
  }
  if (cantidad <= LIMITE_STOCK_BAJO) {
    return "Stock bajo";
  }
  return "Disponible";
}

// Escribe un mensaje verde (éxito) o rojo (error) en la página
function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove("mensaje-error", "mensaje-exito");
  elemento.classList.add(tipo === "error" ? "mensaje-error" : "mensaje-exito");
}

// Muestra el error del formulario de insumos y marca el campo que falló
function mostrarError(texto, campo) {
  mostrarMensaje(mensajeInsumo, texto, "error");
  campo.classList.add("campo-error");
  campo.focus();
}

// Quita las marcas rojas antes de revisar otra vez
function limpiarErrores() {
  for (const campo of [campoNombre, campoCosto, campoCantidad, campoCategoria]) {
    campo.classList.remove("campo-error");
  }
  mensajeInsumo.textContent = "";
}

// Revisa los datos del insumo nuevo.
// Si algo está mal, avisa y se detiene. Si todo está bien, devuelve true
function validarInsumo(nombre, costoTexto, cantidadTexto, categoria) {
  // Validación 1: campos vacíos
  if (nombre === "") {
    mostrarError("El nombre del insumo es obligatorio.", campoNombre);
    return false;
  }
  if (costoTexto === "") {
    mostrarError("Escriba el costo unitario usando solo números.", campoCosto);
    return false;
  }
  if (cantidadTexto === "") {
    mostrarError("Escriba la cantidad en bodega usando solo números.", campoCantidad);
    return false;
  }
  if (categoria === "") {
    mostrarError("Seleccione una categoría.", campoCategoria);
    return false;
  }

  // Validación 2: nombre repetido (sin importar mayúsculas)
  const repetidos = insumos.filter(
    (insumo) => insumo.nombre.toLowerCase() === nombre.toLowerCase()
  );
  if (repetidos.length > 0) {
    mostrarError(`Ya existe un insumo llamado "${nombre}".`, campoNombre);
    return false;
  }

  // Validación 3: número inválido o negativo
  const costo = Number(costoTexto);
  if (Number.isNaN(costo) || costo <= 0) {
    mostrarError("El costo debe ser un número mayor que cero.", campoCosto);
    return false;
  }

  const cantidad = Number(cantidadTexto);
  if (!Number.isInteger(cantidad) || cantidad < 0) {
    mostrarError("La cantidad debe ser un número entero de 0 en adelante.", campoCantidad);
    return false;
  }

  // Validación 4 (propia del tema): en pesos colombianos la moneda
  // más pequeña es de $50, así que el costo debe ser múltiplo de 50
  if (costo % MULTIPLO_COSTO !== 0) {
    mostrarError("El costo debe ser múltiplo de $50, sin centavos.", campoCosto);
    return false;
  }

  return true;
}


/* =====================================================================
   3. Funciones que dibujan la página (tarjetas, tabla, filtros, resumen)
   ===================================================================== */

// Arma la tarjeta de un insumo
function crearTarjeta(insumo) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "insumo";

  // Aspecto especial si está agotado o quedan pocas unidades
  const estado = obtenerEstado(insumo.cantidad);
  if (estado === "Agotado") {
    tarjeta.classList.add("insumo-agotado");
  } else if (estado === "Stock bajo") {
    tarjeta.classList.add("insumo-stock-bajo");
  }

  const imagen = document.createElement("img");
  imagen.className = "insumo-imagen";
  imagen.src = insumo.imagen;
  imagen.alt = `Imagen de ${insumo.nombre}`;
  imagen.width = 640;
  imagen.height = 420;

  const categoria = document.createElement("p");
  categoria.className = "insumo-categoria";
  categoria.textContent = insumo.categoria;

  // Se usa textContent porque el nombre lo escribe el usuario (más seguro)
  const nombre = document.createElement("h3");
  nombre.className = "insumo-nombre";
  nombre.textContent = insumo.nombre;

  const costo = document.createElement("p");
  costo.className = "insumo-costo";
  costo.textContent = formatearPesos(insumo.costo);

  const textoEstado = document.createElement("p");
  textoEstado.className = "insumo-estado";
  textoEstado.textContent = `${estado} · ${insumo.cantidad} en bodega`;

  // data-id guarda el número del insumo que se va a eliminar
  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "boton boton-eliminar";
  botonEliminar.dataset.id = insumo.id;
  botonEliminar.textContent = "Eliminar";
  botonEliminar.setAttribute("aria-label", `Eliminar ${insumo.nombre}`);

  // Se mete todo dentro de la tarjeta
  tarjeta.appendChild(imagen);
  tarjeta.appendChild(categoria);
  tarjeta.appendChild(nombre);
  tarjeta.appendChild(costo);
  tarjeta.appendChild(textoEstado);
  tarjeta.appendChild(botonEliminar);

  return tarjeta;
}

// Dibuja las tarjetas de la lista que recibe
function pintarInsumos(lista) {
  // Borra lo anterior para no repetir tarjetas
  listaInsumos.innerHTML = "";

  // Aviso cuando no hay coincidencias
  if (lista.length === 0) {
    const aviso = document.createElement("p");
    aviso.className = "estado-vacio";
    aviso.textContent = "No hay insumos que coincidan. Pruebe con otra palabra u otra categoría.";
    listaInsumos.appendChild(aviso);
  }

  for (const insumo of lista) {
    listaInsumos.appendChild(crearTarjeta(insumo));
  }

  const palabra = lista.length === 1 ? "resultado" : "resultados";
  contador.textContent = `Mostrando ${lista.length} ${palabra}.`;
}

// Llena la tabla resumen con todos los insumos
function pintarTabla() {
  cuerpoInventario.innerHTML = "";

  for (const insumo of insumos) {
    const fila = document.createElement("tr");
    if (insumo.cantidad === 0) {
      fila.classList.add("fila-agotada");
    }

    // Una celda por columna, en el mismo orden de los títulos
    const celdas = [
      insumo.nombre,
      insumo.categoria,
      formatearPesos(insumo.costo),
      insumo.cantidad,
      obtenerEstado(insumo.cantidad)
    ];

    for (const texto of celdas) {
      const celda = document.createElement("td");
      celda.textContent = texto;
      fila.appendChild(celda);
    }
    cuerpoInventario.appendChild(fila);
  }
}

// Dibuja los botones de categoría con cuántos insumos tiene cada una
function pintarFiltros() {
  listaFiltros.innerHTML = "";

  // Se agrega "Todas" al principio de la lista
  const opciones = ["Todas", ...CATEGORIAS];

  for (const nombre of opciones) {
    const cantidad = nombre === "Todas"
      ? insumos.length
      : insumos.filter((insumo) => insumo.categoria === nombre).length;

    const item = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "filtro";
    boton.dataset.categoria = nombre;

    // Resalta la categoría elegida
    const estaActivo = nombre === categoriaActual;
    boton.classList.toggle("filtro-activo", estaActivo);
    boton.setAttribute("aria-pressed", String(estaActivo));

    const etiqueta = document.createElement("span");
    etiqueta.textContent = nombre;
    const numero = document.createElement("span");
    numero.textContent = cantidad;

    boton.appendChild(etiqueta);
    boton.appendChild(numero);
    item.appendChild(boton);
    listaFiltros.appendChild(item);
  }
}

// Calcula y escribe el resumen de la barra lateral
function pintarResumen() {
  // filter: se queda solo con los agotados
  const agotados = insumos.filter((insumo) => insumo.cantidad === 0).length;
  // reduce: suma las unidades de todos los insumos
  const unidades = insumos.reduce((suma, insumo) => suma + insumo.cantidad, 0);
  // reduce: suma costo por cantidad de todos los insumos
  const valor = insumos.reduce((suma, insumo) => suma + insumo.costo * insumo.cantidad, 0);

  resumenTotal.textContent = insumos.length;
  resumenAgotados.textContent = agotados;
  resumenUnidades.textContent = unidades;
  resumenValor.textContent = formatearPesos(valor);
}

// Llena la tabla de usuarios con las cuentas creadas en contacto
function pintarUsuarios() {
  cuerpoUsuarios.innerHTML = "";

  for (const usuario of usuarios) {
    const fila = document.createElement("tr");
    const celdas = [usuario.nombre, usuario.correo, usuario.telefono, usuario.metodoPago];

    for (const texto of celdas) {
      const celda = document.createElement("td");
      celda.textContent = texto;
      fila.appendChild(celda);
    }
    cuerpoUsuarios.appendChild(fila);
  }
}

// Llena la lista desplegable de categorías del formulario
function llenarCategorias() {
  campoCategoria.innerHTML = "";

  // Primera opción vacía: "Seleccione..."
  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = "Seleccione una categoría";
  campoCategoria.appendChild(inicial);

  for (const nombre of CATEGORIAS) {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre;
    campoCategoria.appendChild(opcion);
  }
}

// Combina el buscador con la categoría elegida y dibuja el resultado
function aplicarFiltros() {
  const texto = buscador.value.trim().toLowerCase();

  let lista = insumos.filter((insumo) => insumo.nombre.toLowerCase().includes(texto));

  if (categoriaActual !== "Todas") {
    lista = lista.filter((insumo) => insumo.categoria === categoriaActual);
  }

  pintarInsumos(lista);
}

// Vuelve a dibujar todo lo que depende de la lista de insumos
function actualizarPantalla() {
  aplicarFiltros();
  pintarTabla();
  pintarFiltros();
  pintarResumen();
}


/* =====================================================================
   4. Eventos
   ===================================================================== */

// ----- Guardar un insumo nuevo -----
formInsumo.addEventListener("submit", function (evento) {
  // Evita que la página se recargue al enviar
  evento.preventDefault();

  limpiarErrores();

  // .value siempre es texto, aunque el campo sea de números
  const nombre = campoNombre.value.trim();
  const costoTexto = campoCosto.value.trim();
  const cantidadTexto = campoCantidad.value.trim();
  const categoria = campoCategoria.value;

  // Si algo está mal, no sigue
  if (!validarInsumo(nombre, costoTexto, cantidadTexto, categoria)) {
    return;
  }

  // Number() convierte el texto en número
  const nuevo = {
    id: siguienteId,
    nombre: nombre,
    costo: Number(costoTexto),
    categoria: categoria,
    cantidad: Number(cantidadTexto),
    imagen: IMAGEN_POR_DEFECTO
  };
  siguienteId++;

  // Se guarda y se quitan los filtros para que el insumo nuevo quede a la vista
  insumos.push(nuevo);
  categoriaActual = "Todas";
  buscador.value = "";
  actualizarPantalla();
  formInsumo.reset();

  mostrarMensaje(mensajeInsumo, `Se agregó "${nombre}" al inventario.`, "exito");
  campoNombre.focus();
});


// ----- Buscar mientras se escribe -----
buscador.addEventListener("input", function () {
  aplicarFiltros();
});


// ----- Elegir una categoría en la barra lateral -----
// Los botones se crean desde JavaScript, por eso se escucha el clic en la lista
listaFiltros.addEventListener("click", function (evento) {
  // closest encuentra el botón aunque el clic caiga en el número
  const boton = evento.target.closest(".filtro");
  if (!boton) {
    return;
  }

  categoriaActual = boton.dataset.categoria;
  pintarFiltros();
  aplicarFiltros();
});


// ----- Eliminar un insumo -----
// Delegación de eventos: un solo clic escuchado en el contenedor de tarjetas
listaInsumos.addEventListener("click", function (evento) {
  const boton = evento.target.closest(".boton-eliminar");
  if (!boton) {
    return;
  }

  const id = Number(boton.dataset.id);
  const indice = insumos.findIndex((insumo) => insumo.id === id);
  if (indice === -1) {
    return;
  }

  // Pide confirmación antes de borrar
  const nombre = insumos[indice].nombre;
  if (!window.confirm(`¿Eliminar "${nombre}" del inventario?`)) {
    return;
  }

  insumos.splice(indice, 1);
  actualizarPantalla();
  mostrarMensaje(mensajeInsumo, `Se eliminó "${nombre}".`, "exito");
});


// ----- Enviar el formulario de contacto -----
// El navegador revisa primero los campos obligatorios.
// Este código solo corre cuando todo está bien
formContacto.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nombre = contactoNombre.value.trim();

  // El navegador deja pasar un nombre hecho solo de espacios
  if (nombre === "") {
    mostrarMensaje(mensajeContacto, "Escriba su nombre completo.", "error");
    contactoNombre.focus();
    return;
  }

  // Guarda la cuenta y la muestra en la tabla de usuarios
  usuarios.push({
    nombre: nombre,
    correo: contactoCorreo.value.trim(),
    telefono: contactoTelefono.value.trim(),
    metodoPago: contactoPago.options[contactoPago.selectedIndex].textContent
  });
  pintarUsuarios();

  mostrarMensaje(
    mensajeContacto,
    `Gracias, ${nombre}. Su cuenta quedó registrada y pronto le escribiremos.`,
    "exito"
  );

  formContacto.reset();
  console.log("El formulario se ha enviado correctamente.");
});


/* =====================================================================
   5. Arranque con DOMContentLoaded
   Cuando la página termina de cargar, se dibuja todo
   ===================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  llenarCategorias();
  actualizarPantalla();

  console.log("Insumos cargados:", insumos.map((insumo) => insumo.nombre));
});
