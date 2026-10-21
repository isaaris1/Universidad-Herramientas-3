// Modo estricto: el navegador avisa más errores
"use strict";

/* =====================================================================
   MODELO
   Guarda los datos, las reglas de negocio y la persistencia.
   No toca el HTML: solo trabaja con arreglos y objetos
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. Constantes y datos iniciales
   --------------------------------------------------------------------- */

// Clave propia del equipo para guardar el inventario en localStorage
const CLAVE_STORAGE = "quanty_montoya_aristizabal_insumos";

// Valores fijos. Van en MAYÚSCULAS porque nunca cambian
const LIMITE_STOCK_BAJO = 10;
const COSTO_MAXIMO = 5000000;
const CANTIDAD_MAXIMA = 100000;
const IMAGEN_POR_DEFECTO = "img/generico.svg";

// Categorías que se muestran en la barra lateral y en el formulario
const CATEGORIAS = ["Telas", "Hilos", "Botones y cierres", "Empaques"];

// Insumos de ejemplo. Solo se usan la primera vez, cuando localStorage está vacío
const INSUMOS_INICIALES = [
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

// Lista de insumos con la que trabaja la aplicación
let insumos = [];

// Cuentas creadas desde el formulario de contacto
const usuarios = [];


/* ---------------------------------------------------------------------
   2. Persistencia con localStorage
   --------------------------------------------------------------------- */

// Lee el inventario guardado. Si no hay nada (o está dañado), usa los de ejemplo
function cargar() {
  try {
    const texto = localStorage.getItem(CLAVE_STORAGE);
    if (texto !== null) {
      insumos = JSON.parse(texto);
      return;
    }
  } catch (error) {
    console.warn("No se pudo leer localStorage, se usan los datos de ejemplo.", error);
  }

  // structuredClone copia los objetos para no modificar los de ejemplo
  insumos = structuredClone(INSUMOS_INICIALES);
  guardar();
}

// Escribe el inventario en localStorage como texto JSON
function guardar() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(insumos));
  } catch (error) {
    console.warn("No se pudo guardar en localStorage.", error);
  }
}


/* ---------------------------------------------------------------------
   3. Reglas de negocio
   --------------------------------------------------------------------- */

// Revisa los datos de un insumo antes de crearlo o actualizarlo.
// idActual es el id del insumo que se está editando (null si es nuevo).
// Devuelve { valido: true } o { valido: false, campo, mensaje }
function validar(datos, idActual = null) {
  // Regla 1: ningún campo puede quedar vacío
  if (datos.nombre === "") {
    return { valido: false, campo: "nombre", mensaje: "El nombre del insumo es obligatorio." };
  }
  if (datos.costo === "") {
    return { valido: false, campo: "costo", mensaje: "Escriba el costo unitario usando solo números." };
  }
  if (datos.cantidad === "") {
    return { valido: false, campo: "cantidad", mensaje: "Escriba la cantidad en bodega usando solo números." };
  }
  if (!CATEGORIAS.includes(datos.categoria)) {
    return { valido: false, campo: "categoria", mensaje: "Seleccione una categoría de la lista." };
  }

  // Regla 2: no se permiten nombres duplicados (sin importar mayúsculas ni espacios).
  // Al editar, el propio insumo no cuenta como duplicado
  const nombreNormal = datos.nombre.toLowerCase();
  const duplicado = insumos.some(
    (insumo) => insumo.nombre.trim().toLowerCase() === nombreNormal && insumo.id !== idActual
  );
  if (duplicado) {
    return { valido: false, campo: "nombre", mensaje: `Ya existe un insumo llamado "${datos.nombre}".` };
  }

  // Regla 3: el costo debe ser un número mayor que cero
  const costo = Number(datos.costo);
  if (Number.isNaN(costo) || costo <= 0) {
    return { valido: false, campo: "costo", mensaje: "El costo debe ser un número mayor que cero." };
  }

  // Regla 4: la cantidad debe ser un entero de 0 en adelante
  const cantidad = Number(datos.cantidad);
  if (!Number.isInteger(cantidad) || cantidad < 0) {
    return { valido: false, campo: "cantidad", mensaje: "La cantidad debe ser un número entero de 0 en adelante." };
  }

  // Regla 5: una bodega de taller no guarda más de 100.000 unidades de un insumo.
  // Así se evitan cifras absurdas que dañan el resumen
  if (cantidad > CANTIDAD_MAXIMA) {
    return { valido: false, campo: "cantidad", mensaje: "La cantidad no puede superar 100.000 unidades." };
  }

  // Regla 6 (propia del tema): un insumo de taller no cuesta más de
  // $5.000.000 por unidad. Así se evitan errores como un cero de más
  if (costo > COSTO_MAXIMO) {
    return { valido: false, campo: "costo", mensaje: "El costo unitario no puede superar $5.000.000." };
  }

  return { valido: true };
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


/* ---------------------------------------------------------------------
   4. CRUD del insumo
   --------------------------------------------------------------------- */

// READ: devuelve todos los insumos
function listar() {
  return insumos;
}

// READ: devuelve un insumo por su id (o undefined si no existe)
function buscarPorId(id) {
  return insumos.find((insumo) => insumo.id === id);
}

// READ: filtra por texto del nombre y por categoría
function filtrar(texto, categoria) {
  const busqueda = texto.trim().toLowerCase();

  return insumos.filter((insumo) => {
    const coincideNombre = insumo.nombre.toLowerCase().includes(busqueda);
    const coincideCategoria = categoria === "Todas" || insumo.categoria === categoria;
    return coincideNombre && coincideCategoria;
  });
}

// Calcula el siguiente id: el mayor que exista más uno (con reduce)
function siguienteId() {
  return insumos.reduce((mayor, insumo) => Math.max(mayor, insumo.id), 0) + 1;
}

// CREATE: valida y agrega un insumo nuevo
function crear(datos) {
  const resultado = validar(datos);
  if (!resultado.valido) {
    return resultado;
  }

  const nuevo = {
    id: siguienteId(),
    nombre: datos.nombre,
    costo: Number(datos.costo),
    categoria: datos.categoria,
    cantidad: Number(datos.cantidad),
    imagen: IMAGEN_POR_DEFECTO
  };

  insumos.push(nuevo);
  guardar();
  return { valido: true, insumo: nuevo };
}

// UPDATE: valida y cambia los datos de un insumo que ya existe
function actualizar(id, datos) {
  const insumo = buscarPorId(id);
  if (!insumo) {
    return { valido: false, campo: "nombre", mensaje: "El insumo que intenta editar ya no existe." };
  }

  const resultado = validar(datos, id);
  if (!resultado.valido) {
    return resultado;
  }

  // La imagen y el id se conservan; lo demás se reemplaza
  insumo.nombre = datos.nombre;
  insumo.costo = Number(datos.costo);
  insumo.categoria = datos.categoria;
  insumo.cantidad = Number(datos.cantidad);

  guardar();
  return { valido: true, insumo: insumo };
}

// DELETE: quita un insumo por su id. Devuelve true si lo encontró
function eliminar(id) {
  const indice = insumos.findIndex((insumo) => insumo.id === id);
  if (indice === -1) {
    return false;
  }

  insumos.splice(indice, 1);
  guardar();
  return true;
}


/* ---------------------------------------------------------------------
   5. Resumen
   --------------------------------------------------------------------- */

// Cuenta cuántos insumos hay en una categoría ("Todas" cuenta todos)
function contarPorCategoria(categoria) {
  if (categoria === "Todas") {
    return insumos.length;
  }
  return insumos.filter((insumo) => insumo.categoria === categoria).length;
}

// Calcula los datos del resumen del inventario
function calcularResumen() {
  // filter: se queda solo con los agotados
  const agotados = insumos.filter((insumo) => insumo.cantidad === 0).length;
  // reduce: suma las unidades de todos los insumos
  const unidades = insumos.reduce((suma, insumo) => suma + insumo.cantidad, 0);
  // reduce: suma costo por cantidad de todos los insumos = valor del inventario
  const valor = insumos.reduce((suma, insumo) => suma + insumo.costo * insumo.cantidad, 0);

  return {
    total: insumos.length,
    agotados: agotados,
    unidades: unidades,
    valor: valor
  };
}


/* ---------------------------------------------------------------------
   6. Usuarios del formulario de contacto
   --------------------------------------------------------------------- */

// Agrega una cuenta nueva a la lista de usuarios
function agregarUsuario(usuario) {
  usuarios.push(usuario);
}

// Devuelve las cuentas creadas
function listarUsuarios() {
  return usuarios;
}
