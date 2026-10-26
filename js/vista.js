// Modo estricto: el navegador avisa más errores
"use strict";

/* =====================================================================
   VISTA
   Todo lo que toca el HTML: busca elementos, dibuja y muestra mensajes.
   No decide reglas ni guarda datos: recibe lo que debe pintar
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. Referencias a los elementos de la página
   --------------------------------------------------------------------- */

// El header fijo y la barra lateral necesitan saber cuánto mide el header
const header = document.querySelector(".header");

// Elementos del formulario de insumos
const formInsumo = document.querySelector("#formInsumo");
const tituloFormulario = document.querySelector("#tituloFormulario");
const campoNombre = document.querySelector("#insumoNombre");
const campoCosto = document.querySelector("#insumoCosto");
const campoCantidad = document.querySelector("#insumoCantidad");
const campoCategoria = document.querySelector("#insumoCategoria");
const botonGuardar = document.querySelector("#botonGuardar");
const botonCancelar = document.querySelector("#botonCancelar");
const mensajeInsumo = document.querySelector("#mensajeInsumo");

// Relaciona el nombre del dato con su campo, para marcar errores
const CAMPOS = {
  nombre: campoNombre,
  costo: campoCosto,
  cantidad: campoCantidad,
  categoria: campoCategoria
};

// Elementos del buscador, las tarjetas y la tabla
const buscador = document.querySelector("#buscador");
const contador = document.querySelector("#contador");
const listaInsumos = document.querySelector("#listaInsumos");
const cuerpoInventario = document.querySelector("#cuerpoInventario");
const totalInventario = document.querySelector("#totalInventario");

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


/* ---------------------------------------------------------------------
   2. Funciones de ayuda
   --------------------------------------------------------------------- */

// Convierte un número en pesos colombianos: 18500 → $ 18.500
function formatearPesos(valor) {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });
}

// Guarda la altura real del header en la variable CSS --alto-header.
// Se vuelve a medir cuando el header cambia de tamaño (por ejemplo, el menú pasa a dos líneas)
function ajustarAlturaHeader() {
  const actualizar = () => {
    document.documentElement.style.setProperty("--alto-header", `${header.offsetHeight}px`);
  };

  actualizar();
  new ResizeObserver(actualizar).observe(header);
}

// Escribe un mensaje verde (éxito) o rojo (error) en la página
function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove("mensaje-error", "mensaje-exito");
  elemento.classList.add(tipo === "error" ? "mensaje-error" : "mensaje-exito");
}

// Muestra el error del formulario de insumos y marca el campo que falló
function mostrarError(texto, nombreCampo) {
  const campo = CAMPOS[nombreCampo];
  mostrarMensaje(mensajeInsumo, texto, "error");
  campo.classList.add("campo-error");
  campo.focus();
}

// Quita las marcas rojas antes de revisar otra vez
function limpiarErrores() {
  for (const campo of Object.values(CAMPOS)) {
    campo.classList.remove("campo-error");
  }
  mensajeInsumo.textContent = "";
}


/* ---------------------------------------------------------------------
   3. Formulario de insumos (crear y editar)
   --------------------------------------------------------------------- */

// Lee los campos del formulario. .value siempre es texto
function leerFormulario() {
  return {
    nombre: campoNombre.value.trim(),
    costo: campoCosto.value.trim(),
    cantidad: campoCantidad.value.trim(),
    categoria: campoCategoria.value
  };
}

// Pone los datos de un insumo en el formulario para editarlo
function llenarFormulario(insumo) {
  campoNombre.value = insumo.nombre;
  campoCosto.value = insumo.costo;
  campoCantidad.value = insumo.cantidad;
  campoCategoria.value = insumo.categoria;
}

// Cambia el formulario entre "agregar" y "editar"
function mostrarModoEdicion(activo) {
  tituloFormulario.textContent = activo ? "Editar insumo" : "Agregar un insumo";
  botonGuardar.textContent = activo ? "Guardar cambios" : "Guardar insumo";
  botonCancelar.hidden = !activo;
  formInsumo.classList.toggle("form-editando", activo);
}

// Deja el formulario vacío y en modo "agregar"
function limpiarFormulario() {
  formInsumo.reset();
  limpiarErrores();
  mostrarModoEdicion(false);
}

// Llena la lista desplegable de categorías del formulario
function llenarCategorias(categorias) {
  campoCategoria.innerHTML = "";

  // Primera opción vacía: "Seleccione..."
  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = "Seleccione una categoría";
  campoCategoria.appendChild(inicial);

  for (const nombre of categorias) {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre;
    campoCategoria.appendChild(opcion);
  }
}


/* ---------------------------------------------------------------------
   4. Funciones que dibujan la página (tarjetas, tabla, filtros, resumen)
   --------------------------------------------------------------------- */

// Crea un botón de acción para la tarjeta (Editar o Eliminar)
function crearBotonAccion(texto, clase, insumo) {
  // data-id guarda el número del insumo sobre el que se actúa
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = `boton ${clase}`;
  boton.dataset.id = insumo.id;
  boton.textContent = texto;
  boton.setAttribute("aria-label", `${texto} ${insumo.nombre}`);
  return boton;
}

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

  // Botones de editar y eliminar, uno al lado del otro
  const acciones = document.createElement("div");
  acciones.className = "insumo-acciones";
  acciones.appendChild(crearBotonAccion("Editar", "boton-editar", insumo));
  acciones.appendChild(crearBotonAccion("Eliminar", "boton-eliminar", insumo));

  // Se mete todo dentro de la tarjeta
  tarjeta.appendChild(imagen);
  tarjeta.appendChild(categoria);
  tarjeta.appendChild(nombre);
  tarjeta.appendChild(costo);
  tarjeta.appendChild(textoEstado);
  tarjeta.appendChild(acciones);

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

// Llena la tabla resumen con todos los insumos y el valor total
function pintarTabla(lista, valorTotal) {
  cuerpoInventario.innerHTML = "";

  for (const insumo of lista) {
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
      formatearPesos(insumo.costo * insumo.cantidad),
      obtenerEstado(insumo.cantidad)
    ];

    for (const texto of celdas) {
      const celda = document.createElement("td");
      celda.textContent = texto;
      fila.appendChild(celda);
    }
    cuerpoInventario.appendChild(fila);
  }

  totalInventario.textContent = formatearPesos(valorTotal);
}

// Dibuja los botones de categoría con cuántos insumos tiene cada una.
// opciones es una lista de { nombre, cantidad }
function pintarFiltros(opciones, categoriaActual) {
  listaFiltros.innerHTML = "";

  for (const opcion of opciones) {
    const item = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "filtro";
    boton.dataset.categoria = opcion.nombre;

    // Resalta la categoría elegida
    const estaActivo = opcion.nombre === categoriaActual;
    boton.classList.toggle("filtro-activo", estaActivo);
    boton.setAttribute("aria-pressed", String(estaActivo));

    const etiqueta = document.createElement("span");
    etiqueta.textContent = opcion.nombre;
    const numero = document.createElement("span");
    numero.textContent = opcion.cantidad;

    boton.appendChild(etiqueta);
    boton.appendChild(numero);
    item.appendChild(boton);
    listaFiltros.appendChild(item);
  }
}

// Escribe el resumen de la barra lateral
function pintarResumen(resumen) {
  resumenTotal.textContent = resumen.total;
  resumenAgotados.textContent = resumen.agotados;
  resumenUnidades.textContent = resumen.unidades;
  resumenValor.textContent = formatearPesos(resumen.valor);
}

// Llena la tabla de usuarios con las cuentas creadas en contacto
function pintarUsuarios(lista) {
  cuerpoUsuarios.innerHTML = "";

  for (const usuario of lista) {
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
