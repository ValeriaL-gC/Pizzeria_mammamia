class Pedido {


    constructor(numeroPedido, mesa){
        this.numeroPedido = numeroPedido;
        this.mesa = mesa;
        this.productos = [];
        this.estado = "Creado";
        this.total = 0;
    }



    agregarProducto(producto){
        this.productos.push(producto);
        this.total += producto.precio;
    }



    eliminarProducto(nombreProducto){
        let posicion = this.productos.findIndex(
            producto => producto.nombre === nombreProducto
        );

        if(posicion !== -1){
            this.total -= this.productos[posicion].precio;
            this.productos.splice(posicion,1);
        }
    }



    mostrarPedido(){
        console.log("--------------------");
        console.log("Pedido:", this.numeroPedido);
        console.log("Mesa:", this.mesa.numero);
        console.log("Estado:", this.estado);
        console.log("Productos:");
        this.productos.forEach(producto=>{
            console.log(
                producto.nombre
            );
        });


        console.log("Total:", this.total);
        console.log("--------------------");
    }
}