class UsuarioModel {
    constructor() {
        this.usuarios = [];
    }
    agregar(nombre, correo, telefono, metodoPago) {
        const nuevo = {
            nombre,
            correo,
            telefono,
            metodoPago
        };
        this.usuarios.push(nuevo);
        return this.usuarios;
    }
}

class UsuarioView {
    constructor() {
        this.form = document.getElementById('formulario');
        this.nombre = document.getElementById('nombre');
        this.correo = document.getElementById('email');
        this.telefono = document.getElementById('telefono');
        this.metodoPago = document.getElementById('metodo-pago');
        this.cuerpoTabla = document.getElementById('cuerpo-tabla');
    }

    limpiarFormulario() {
        this.form.reset();
    }

    mostrarUsuarios(usuarios) {
        this.cuerpoTabla.innerHTML = ''; 

        usuarios.forEach(usuario => {
            const fila = `
                <tr>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.correo}</td>
                    <td>${usuario.telefono}</td>
                    <td>${usuario.metodoPago}</td>
                </tr>
            `;
            this.cuerpoTabla.innerHTML += fila;
        });
    }
}

class UsuarioController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.procesarFormulario();
        });
    }

    procesarFormulario() {
        const nombre = this.view.nombre.value;
        const correo = this.view.correo.value;
        const telefono = this.view.telefono.value;
        const metodoPago = this.view.metodoPago.value;

        if (nombre && correo && telefono && metodoPago) {
            const usuariosActualizados = this.model.agregar(nombre, correo, telefono, metodoPago);
            this.view.mostrarUsuarios(usuariosActualizados);
            this.view.limpiarFormulario();
        }
    }
}

window.onload = () => {
    const app = new UsuarioController(new UsuarioModel(), new UsuarioView());
};


