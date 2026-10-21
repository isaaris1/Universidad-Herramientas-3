# Quanty Landing Page

Bienvenid@s al repositorio de la landing page oficial de **Quanty**. Este proyecto es una vitrina web diseñada para presentar nuestra aplicación de gestión para pequeños negocios y contratistas independientes.


Está elaborado por: Isabella Aristizabal Díaz y Daniela Montoya Quintero

---

## Sobre el Proyecto

**Quanty** es una solución de software pensada para simplificar la administración, costos y flujos de trabajo de microempresas y contratistas. Esta landing page tiene como objetivo comunicar de forma clara, estética y accesible la propuesta de valor del software, sus características principales y facilitar el contacto con futuros usuarios.

Además de presentar el producto, la página incluye una demostración interactiva: el **inventario de insumos de un taller de confección**, con CRUD completo (agregar, ver, editar y eliminar insumos), buscador y filtros. Los datos se guardan en el navegador con `localStorage`.

---

## Tecnologías Utilizadas

Para garantizar un código limpio, estructurado y de alto rendimiento, el proyecto se desarrolló utilizando un stack 100% nativo, sin librerías ni frameworks:

*   **HTML:** Estructuración semántica del contenido, optimizada para accesibilidad y SEO básico.
*   **CSS3:** Diseño visual, arquitectura de layouts (Flexbox/Grid), tipografías, paleta de colores y diseño completamente responsivo (*Responsive Web Design*).
*   **JavaScript:** Manejo del DOM, eventos y arreglos de objetos para darle vida al inventario y al formulario de contacto.

---

## Estructura del Proyecto

```
Universidad-Herramientas-3/
├── index.html          Toda la página; los scripts se conectan antes de cerrar </body>
├── css/
│   └── estilos.css     Estilos de la página y clases que activa JavaScript
├── js/
│   ├── modelo.js       Datos, reglas de negocio (validar), CRUD, localStorage y resumen
│   ├── vista.js        Todo lo que toca el HTML: pintar tarjetas, tabla, filtros y mensajes
│   └── controlador.js  Eventos: conecta lo que hace el usuario con el modelo y la vista
└── img/                Logos e ilustraciones de los insumos
```

---

## Características Principales

*   **Diseño Responsive:** Adaptable a cualquier dispositivo. En teléfono y tableta la barra lateral pasa arriba del contenido.
*   **Arquitectura Semántica:** Uso correcto de etiquetas HTML5 (`<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<article>`, `<footer>`) para un código más legible y profesional.
*   **Secciones Estratégicas:**
    *   **Hero Section:** Introducción clara con un llamado a la acción (CTA) directo.
    *   **Inventario:** Formulario para agregar insumos, buscador y tarjetas dibujadas desde JavaScript.
    *   **Resumen:** Tabla con las existencias de cada insumo, llenada desde JavaScript.
    *   **Características:** Desglose visual de lo que hace único a Quanty.
    *   **Planes:** Tabla comparativa de precios.
    *   **Contacto:** Formulario de registro con validación del navegador.

---

## Funcionalidades con JavaScript

1.  **Pintar desde los datos:** las tarjetas y la tabla se dibujan a partir de un arreglo de objetos, con `createElement` y `appendChild`. Los textos del usuario se escriben con `textContent`.
2.  **CRUD completo del insumo:**
    *   **Crear:** el formulario usa `preventDefault()` y le pasa los datos a `crear()` del modelo.
    *   **Leer:** `listar()`, `buscarPorId()` y `filtrar()` entregan los insumos que la vista dibuja.
    *   **Actualizar:** el botón **Editar** de cada tarjeta carga el insumo en el formulario; al guardar se llama `actualizar()`. El botón **Cancelar** sale del modo edición.
    *   **Eliminar:** el botón **Eliminar** pide confirmación y llama `eliminar()`.
3.  **Reglas de negocio en `validar()`:** campos obligatorios y categoría válida, **sin nombres duplicados** (sin importar mayúsculas; al editar, el propio insumo no cuenta), costo mayor que cero, cantidad entera entre 0 y 100.000 unidades y costo unitario máximo de $5.000.000. Cada error se muestra en la página y marca el campo que falló.
4.  **Persistencia con `localStorage`:** el inventario se guarda con la clave propia del equipo `quanty_montoya_aristizabal_insumos` cada vez que se crea, edita o elimina un insumo, y se lee al abrir la página. La primera vez se cargan los insumos de ejemplo.
5.  **Buscar:** filtra mientras se escribe, sin distinguir mayúsculas, con contador de resultados y aviso cuando no hay coincidencias.
6.  **Filtrar por categoría:** botones en la barra lateral, creados desde JavaScript, que se combinan con el buscador.
7.  **Resumen con `reduce`:** `calcularResumen()` suma con `reduce` las unidades y el **valor total del inventario** (costo × cantidad). El valor se muestra en la barra lateral y en el pie de la tabla de resumen. Se actualiza al crear, editar o eliminar.
8.  **Contacto:** al enviar no se recarga la página, se muestra un mensaje de confirmación con el nombre de la persona, se agrega a la tabla de usuarios nuevos y se limpia el formulario.
9.  **Estados visuales con clases:** insumo agotado, stock bajo, categoría seleccionada, formulario en edición y campo con error se manejan con `classList`, sin `element.style`.

### Organización del JavaScript (Modelo - Vista - Controlador)

Los tres archivos se cargan en este orden al final de `index.html`:

1.  **`modelo.js`:** constantes, datos de ejemplo, `cargar()` y `guardar()` con `localStorage`, `validar()`, el CRUD (`listar`, `buscarPorId`, `filtrar`, `crear`, `actualizar`, `eliminar`) y `calcularResumen()`. No toca el HTML.
2.  **`vista.js`:** referencias a los elementos de la página y las funciones que leen el formulario, dibujan tarjetas, tabla, filtros y resumen, y muestran mensajes. No guarda datos ni decide reglas.
3.  **`controlador.js`:** estado de la pantalla (categoría elegida e insumo en edición), los eventos y el arranque con `DOMContentLoaded`. Le pide los datos al modelo y le dice a la vista qué pintar.

Para volver a los datos de ejemplo, borre la clave `quanty_montoya_aristizabal_insumos` en *F12 → Aplicación → Almacenamiento local*.

---

## Cómo Visualizar el Proyecto Localmente

Si deseas clonar este repositorio y ejecutar la landing page en tu máquina local, sigue estos sencillos pasos:

1. **Clona el repositorio:**
```bash
git clone https://github.com/isaaris1/Universidad-Herramientas-3.git
```

2. **Abre la página:** entra a la carpeta `Universidad-Herramientas-3` y abre el archivo `index.html` en tu navegador. También puedes abrir la carpeta en Visual Studio Code y usar la extensión *Live Server*.

3. **Revisa la consola:** presiona `F12` para confirmar que no aparecen errores.
