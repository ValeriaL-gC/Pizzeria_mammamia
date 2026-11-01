class Nodo {
    constructor(dato) {
        this.dato = dato;
        this.siguiente = null;
    }

}

class ListaEnlazada {
    constructor() {
        this.cabeza = null;
    }

    insertar(dato) {
        const nuevoNodo = new Nodo(dato);
        if (this.cabeza === null) {
            this.cabeza = nuevoNodo;
            return;
        }

        let actual = this.cabeza;
        while (actual.siguiente !== null) {
            actual = actual.siguiente;
        }

        actual.siguiente = nuevoNodo;
    }

    buscar(numeroPedido) {
        let actual = this.cabeza;
        while (actual !== null) {
            if (actual.dato.numeroPedido === numeroPedido) {
                return actual.dato;
            }

            actual = actual.siguiente;

        }

        return null;

    }

    modificar(numeroPedido, nuevosDatos) {
        let actual = this.cabeza;
        while (actual !== null) {
            if (actual.dato.numeroPedido === numeroPedido) {
                Object.assign(actual.dato, nuevosDatos);
                return true;
            }

            actual = actual.siguiente;

        }

        return false;

    }

    eliminar(numeroPedido) {
        if (this.cabeza === null) {
            return false;
        }

        if (this.cabeza.dato.numeroPedido === numeroPedido) {
            this.cabeza = this.cabeza.siguiente;
            return true;
        }

        let actual = this.cabeza;

        while (actual.siguiente !== null) {
            if (actual.siguiente.dato.numeroPedido === numeroPedido) {
                actual.siguiente = actual.siguiente.siguiente;
                return true;

            }

            actual = actual.siguiente;

        }

        return false;

    }

    recorrer() {
        let pedidos = [];
        let actual = this.cabeza;
        while (actual !== null) {
            pedidos.push(actual.dato);
            actual = actual.siguiente;
        }

        return pedidos;

    }

}