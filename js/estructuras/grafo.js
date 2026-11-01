class NodoGrafo {

    constructor(producto) {

        this.producto = producto;
        this.relacionados = [];

    }

}

class Grafo {

    constructor() {

        this.nodos = [];

    }

    agregarNodo(producto) {

        const existe = this.nodos.find(
            nodo => nodo.producto.nombre === producto.nombre
        );

        if (!existe) {

            this.nodos.push(
                new NodoGrafo(producto)
            );

        }

    }

    conectarProductos(nombre1, nombre2) {

        const nodo1 = this.nodos.find(
            nodo => nodo.producto.nombre === nombre1
        );

        const nodo2 = this.nodos.find(
            nodo => nodo.producto.nombre === nombre2
        );

        if (!nodo1 || !nodo2) return;

        if (!nodo1.relacionados.includes(nodo2.producto)) {

            nodo1.relacionados.push(nodo2.producto);

        }

        if (!nodo2.relacionados.includes(nodo1.producto)) {

            nodo2.relacionados.push(nodo1.producto);

        }

    }

    obtenerRelacionados(nombreProducto) {

        const nodo = this.nodos.find(
            nodo => nodo.producto.nombre === nombreProducto
        );

        if (!nodo) {

            return [];

        }

        return nodo.relacionados;

    }

    mostrarRelaciones() {

        console.log("===== GRAFO =====");

        this.nodos.forEach(nodo => {

            console.log(
                nodo.producto.nombre,
                "→",
                nodo.relacionados.map(
                    producto => producto.nombre
                )
            );

        });

    }

}