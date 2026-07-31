class GestorMenu {

    constructor() {
        this.menu = [];
    }

    cargarProductos() {

        this.menu.push(

            // Pizzas Tradicionales
            new Producto(1, "Pepperoni", "Pizzas/Tradicionales", 10.50),
            new Producto(2, "Hawaiana", "Pizzas/Tradicionales", 11.00),
            new Producto(3, "Jamón", "Pizzas/Tradicionales", 10.00),
            new Producto(4, "Margarita", "Pizzas/Tradicionales", 9.50),

            // Pizzas Especiales
            new Producto(5, "BBQ", "Pizzas/Especiales", 13.50),
            new Producto(6, "Suprema", "Pizzas/Especiales", 14.00),
            new Producto(7, "Cuatro Quesos", "Pizzas/Especiales", 13.00),

            // Bebidas
            new Producto(8, "Coca-Cola", "Bebidas", 2.00),
            new Producto(9, "Sprite", "Bebidas", 2.00),
            new Producto(10, "Agua", "Bebidas", 1.50),

            // Postres
            new Producto(11, "Brownie", "Postres", 3.50),
            new Producto(12, "Cheesecake", "Postres", 4.00)

        );

    }

    //arbol
    crearArbolMenu() {
        const arbol = new Arbol();

        const pizzas = new NodoArbol("Pizzas");
        const bebidas = new NodoArbol("Bebidas");
        const postres = new NodoArbol("Postres");

        const tradicionales = new NodoArbol("Tradicionales");
        const especiales = new NodoArbol("Especiales");

        pizzas.agregarHijo(tradicionales);
        pizzas.agregarHijo(especiales);

        this.menu.forEach(producto => {

            const nodoProducto = new NodoArbol(producto.nombre);

            switch (producto.categoria) {
                case "Pizzas/Tradicionales":
                    tradicionales.agregarHijo(nodoProducto);
                    break;

                case "Pizzas/Especiales":
                    especiales.agregarHijo(nodoProducto);
                    break;

                case "Bebidas":
                    bebidas.agregarHijo(nodoProducto);
                    break;

                case "Postres":
                    postres.agregarHijo(nodoProducto);
                    break;
            }
        });

        arbol.raiz.agregarHijo(pizzas);
        arbol.raiz.agregarHijo(bebidas);
        arbol.raiz.agregarHijo(postres);
        return arbol;

    }

    mostrarMenu() {

        console.log("===== MENÚ =====");
        this.menu.forEach(producto => {
            console.log(
                `${producto.id}. ${producto.nombre} | ${producto.categoria} | $${producto.precio}`
            );
        });
    }

    buscarProducto(nombre){
        for(let producto of this.menu){
            if(producto.nombre.toLowerCase() === nombre.toLowerCase()){
                return producto;
            }
        }

        return null;
    }

    ordenarPorNombre(){
        for(let i = 0; i < this.menu.length - 1; i++){
            for(let j = 0; j < this.menu.length - i - 1; j++){
                if(this.menu[j].nombre > this.menu[j + 1].nombre){
                    let auxiliar = this.menu[j];
                    this.menu[j] = this.menu[j + 1];
                    this.menu[j + 1] = auxiliar;
                }
            }
        }
    }

    ordenarPorPrecio(){
        for(let i = 0; i < this.menu.length - 1; i++){
            for(let j = 0; j < this.menu.length - i - 1; j++){
                if(this.menu[j].precio > this.menu[j + 1].precio){
                    let auxiliar = this.menu[j];
                    this.menu[j] = this.menu[j + 1];
                    this.menu[j + 1] = auxiliar;
                }
            }
        }
    }

    obtenerProducto(id){
        for(let producto of this.menu){
            if(producto.id === id){
                return producto;
            }
        }

        return null;
    }

}

