# Quanty Landing Page

Bienvenid@s al repositorio de la landing page oficial de **Quanty**. Este proyecto es una vitrina web diseñada para presentar nuestra aplicación de gestión para pequeños negocios y contratistas independientes.


Está elaborado por: Isabella Aristizabal Díaz y Daniela Montoya Quintero

---

## Sobre el Proyecto

**Quanty** es una solución de software pensada para simplificar la administración, costos y flujos de trabajo de microempresas y contratistas. Esta landing page tiene como objetivo comunicar de forma clara, estética y accesible la propuesta de valor del software, sus características principales y facilitar el contacto con futuros usuarios.

Además de presentar el producto, la página incluye una demostración interactiva: el **inventario de insumos de un taller de confección**, donde se pueden agregar, buscar, filtrar y eliminar insumos directamente en el navegador.

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
├── index.html          Toda la página; el script se conecta antes de cerrar </body>
├── css/
│   └── estilos.css     Estilos de la página y clases que activa JavaScript
├── js/
│   └── app.js          Todo el JavaScript del proyecto
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
2.  **Agregar insumos:** el formulario usa `preventDefault()`, convierte con `Number()` y valida con retorno temprano: campos vacíos, nombre repetido, número inválido o negativo y costo múltiplo de $50. Cada error se muestra en la página.
3.  **Buscar:** filtra mientras se escribe, sin distinguir mayúsculas, con contador de resultados y aviso cuando no hay coincidencias.
4.  **Filtrar por categoría:** botones en la barra lateral, creados desde JavaScript, que se combinan con el buscador.
5.  **Eliminar:** botón con `data-id` en cada tarjeta, resuelto con delegación de eventos y con confirmación antes de borrar.
6.  **Resumen:** total de insumos, agotados, unidades y valor del inventario, calculados con `filter` y `reduce`. Se actualiza al agregar o eliminar.
7.  **Contacto:** al enviar no se recarga la página, se muestra un mensaje de confirmación con el nombre de la persona, se agrega a la tabla de usuarios nuevos y se limpia el formulario.
8.  **Estados visuales con clases:** insumo agotado, stock bajo, categoría seleccionada y campo con error se manejan con `classList`, sin `element.style`.

### Organización de `app.js`

El archivo está dividido en cinco partes, cada una con su comentario de título:

1.  Datos y referencias a los elementos de la página.
2.  Funciones de ayuda.
3.  Funciones que dibujan la página.
4.  Eventos.
5.  Arranque con `DOMContentLoaded`.

---

## Cómo Visualizar el Proyecto Localmente

Si deseas clonar este repositorio y ejecutar la landing page en tu máquina local, sigue estos sencillos pasos:

1. **Clona el repositorio:**
```bash
git clone https://github.com/isaaris1/Universidad-Herramientas-3.git
```

2. **Abre la página:** entra a la carpeta `Universidad-Herramientas-3` y abre el archivo `index.html` en tu navegador. También puedes abrir la carpeta en Visual Studio Code y usar la extensión *Live Server*.

3. **Revisa la consola:** presiona `F12` para confirmar que no aparecen errores.
