class NodoArbol {
    constructor(nombre) {
        this.nombre = nombre;
        this.hijos = [];
    }

    agregarHijo(nodo) {
        this.hijos.push(nodo);
    }

}

class Arbol {
    constructor() {
        this.raiz = new NodoArbol("Menú");
    }


    agregarCategoria(nombreCategoria) {
        const categoria = new NodoArbol(nombreCategoria);
        this.raiz.agregarHijo(categoria);
        return categoria;
    }



    agregarProducto(categoria, nombreProducto) {
        const producto = new NodoArbol(nombreProducto);
        categoria.agregarHijo(producto);
    }



    mostrar(nodo = this.raiz, nivel = 0) {
        console.log(
            " ".repeat(nivel * 4) + nodo.nombre
        );


        nodo.hijos.forEach(hijo => {
            this.mostrar(hijo, nivel + 1);
        });
    }



    buscar(nombre, nodo = this.raiz) {
        if(nodo.nombre === nombre){
            return nodo;
        }


        for(let hijo of nodo.hijos){
            let encontrado = this.buscar(nombre, hijo);
            if(encontrado){
                return encontrado;
            }
        }


        return null;

    }

}