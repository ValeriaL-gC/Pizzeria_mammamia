class Producto {

    // tiempoPreparacion: minutos que demora el producto en cocina.
    // Si no se especifica, se calcula un valor por defecto
    // según la categoría (bebidas rápidas, postres medios,
    // pizzas más lentas).
    constructor(id, nombre, categoria, precio, tiempoPreparacion){

        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.tiempoPreparacion =
            tiempoPreparacion !== undefined
                ? tiempoPreparacion
                : Producto.tiempoPorDefecto(categoria);

    }


    static tiempoPorDefecto(categoria){

        if(categoria === "Bebidas"){
            return 1;
        }

        if(categoria === "Postres"){
            return 4;
        }

        // Pizzas tradicionales y especiales
        return 12;

    }


    mostrarProducto(){

        return `${this.nombre} - $${this.precio}`;

    }

}