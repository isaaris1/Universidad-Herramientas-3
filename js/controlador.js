// Modo estricto: el navegador avisa más errores
"use strict";

/* =====================================================================
   CONTROLADOR
   Escucha los eventos, le pide los datos al modelo y le dice
   a la vista qué dibujar. Es el puente entre los dos
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. Estado de la pantalla
   --------------------------------------------------------------------- */

// Valores que cambian mientras se usa la página, por eso van con let
let categoriaActual = "Todas";
// id del insumo que se está editando. null = se está agregando uno nuevo
let idEditando = null;


/* ---------------------------------------------------------------------
   2. Funciones que coordinan modelo y vista
   --------------------------------------------------------------------- */

// Combina el buscador con la categoría elegida y dibuja el resultado
function aplicarFiltros() {
  pintarInsumos(filtrar(buscador.value, categoriaActual));
}

// Arma la lista de botones de categoría con su cantidad
function actualizarFiltros() {
  const opciones = ["Todas", ...CATEGORIAS].map((nombre) => ({
    nombre: nombre,
    cantidad: contarPorCategoria(nombre)
  }));
  pintarFiltros(opciones, categoriaActual);
}

// Vuelve a dibujar todo lo que depende de la lista de insumos
function actualizarPantalla() {
  const resumen = calcularResumen();

  aplicarFiltros();
  pintarTabla(listar(), resumen.valor);
  actualizarFiltros();
  pintarResumen(resumen);
}

// Sale del modo edición y deja el formulario listo para agregar
function cancelarEdicion() {
  idEditando = null;
  limpiarFormulario();
}

// Pone un insumo en el formulario para cambiar sus datos
function empezarEdicion(id) {
  const insumo = buscarPorId(id);
  if (!insumo) {
    return;
  }

  idEditando = id;
  limpiarErrores();
  llenarFormulario(insumo);
  mostrarModoEdicion(true);

  // Lleva al usuario al formulario para que vea lo que va a editar
  formInsumo.scrollIntoView({ behavior: "smooth", block: "center" });
  campoNombre.focus({ preventScroll: true });
}

// Pide confirmación y borra el insumo
function borrarInsumo(id) {
  const insumo = buscarPorId(id);
  if (!insumo) {
    return;
  }

  // Pide confirmación antes de borrar
  const nombre = insumo.nombre;
  if (!window.confirm(`¿Eliminar "${nombre}" del inventario?`)) {
    return;
  }

  eliminar(id);

  // Si se borra el insumo que se estaba editando, se cancela la edición
  if (idEditando === id) {
    cancelarEdicion();
  }

  actualizarPantalla();
  mostrarMensaje(mensajeInsumo, `Se eliminó "${nombre}".`, "exito");
}


/* ---------------------------------------------------------------------
   3. Eventos
   --------------------------------------------------------------------- */

// ----- Guardar: crea un insumo nuevo o actualiza el que se está editando -----
formInsumo.addEventListener("submit", function (evento) {
  // Evita que la página se recargue al enviar
  evento.preventDefault();

  limpiarErrores();

  const datos = leerFormulario();
  const editando = idEditando !== null;

  // El modelo valida con validar() antes de guardar
  const resultado = editando ? actualizar(idEditando, datos) : crear(datos);

  // Si algo está mal, se muestra el error y no sigue
  if (!resultado.valido) {
    mostrarError(resultado.mensaje, resultado.campo);
    return;
  }

  // Se quitan los filtros para que el insumo quede a la vista
  categoriaActual = "Todas";
  buscador.value = "";
  cancelarEdicion();
  actualizarPantalla();

  const accion = editando ? "Se actualizó" : "Se agregó";
  mostrarMensaje(mensajeInsumo, `${accion} "${resultado.insumo.nombre}" en el inventario.`, "exito");
  campoNombre.focus();
});


// ----- Cancelar la edición -----
botonCancelar.addEventListener("click", function () {
  cancelarEdicion();
  mostrarMensaje(mensajeInsumo, "Edición cancelada.", "exito");
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
  actualizarFiltros();
  aplicarFiltros();
});


// ----- Editar o eliminar un insumo -----
// Delegación de eventos: un solo clic escuchado en el contenedor de tarjetas
listaInsumos.addEventListener("click", function (evento) {
  const botonEditar = evento.target.closest(".boton-editar");
  const botonEliminar = evento.target.closest(".boton-eliminar");

  if (botonEditar) {
    empezarEdicion(Number(botonEditar.dataset.id));
  } else if (botonEliminar) {
    borrarInsumo(Number(botonEliminar.dataset.id));
  }
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
  agregarUsuario({
    nombre: nombre,
    correo: contactoCorreo.value.trim(),
    telefono: contactoTelefono.value.trim(),
    metodoPago: contactoPago.options[contactoPago.selectedIndex].textContent
  });
  pintarUsuarios(listarUsuarios());

  mostrarMensaje(
    mensajeContacto,
    `Gracias, ${nombre}. Su cuenta quedó registrada y pronto le escribiremos.`,
    "exito"
  );

  formContacto.reset();
  console.log("El formulario se ha enviado correctamente.");
});


/* ---------------------------------------------------------------------
   4. Arranque con DOMContentLoaded
   Cuando la página termina de cargar, se leen los datos y se dibuja todo
   --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  cargar();
  ajustarAlturaHeader();
  llenarCategorias(CATEGORIAS);
  actualizarPantalla();

  console.log("Insumos cargados desde localStorage:", listar().map((insumo) => insumo.nombre));
});
