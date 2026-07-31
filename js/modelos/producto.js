class Producto {

    constructor(id, nombre, categoria, precio){

        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;

    }


    mostrarProducto(){

        return `${this.nombre} - $${this.precio}`;

    }

}