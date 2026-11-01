class Pedido {


    constructor(numeroPedido, mesa){
        this.numeroPedido = numeroPedido;
        this.mesa = mesa;
        this.productos = [];
        this.estado = "Creado";
        this.total = 0;


        this.historialAcciones = new Pila();

        this.sugerenciasMostradas = [];

        this.tiempoTotalPreparacion = 0;
        this.horaEnvioCocina = null;
        this.horaListo = null;
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


    eliminarProductoCompleto(nombreProducto){
        const eliminados = [];

        this.productos = this.productos.filter(producto => {
            if(producto.nombre === nombreProducto){
                this.total -= producto.precio;
                eliminados.push(producto);
                return false;
            }
            return true;
        });

        return eliminados;
    }


    calcularTiempoTotal(){
        return this.productos.reduce(
            (suma, producto) =>
                suma + (producto.tiempoPreparacion || 0),
            0
        );
    }


    productosOrdenadosPorTiempo(){

        const agrupados = {};

        this.productos.forEach(producto => {

            if(!agrupados[producto.nombre]){
                agrupados[producto.nombre] = {
                    producto: producto,
                    cantidad: 0
                };
            }

            agrupados[producto.nombre].cantidad++;

        });

        const lista = Object.values(agrupados);

        const noPostres = lista
            .filter(item => item.producto.categoria !== "Postres")
            .sort((a, b) =>
                a.producto.tiempoPreparacion -
                b.producto.tiempoPreparacion
            );

        const postres = lista
            .filter(item => item.producto.categoria === "Postres")
            .sort((a, b) =>
                a.producto.tiempoPreparacion -
                b.producto.tiempoPreparacion
            );

        return noPostres.concat(postres);

    }


    mostrarPedido() {

        console.log("--------------------");

        console.log("Pedido:", this.numeroPedido);
        console.log("Mesa:", this.mesa.numero);
        console.log("Estado:", this.estado);

        console.log("Productos:");

        let productosAgrupados = {};

        this.productos.forEach(producto => {

            if(productosAgrupados[producto.nombre]){

                productosAgrupados[producto.nombre].cantidad++;

            }
            else{

                productosAgrupados[producto.nombre] = {

                    precio: producto.precio,
                    cantidad: 1

                };

            }

        });

        for(let nombre in productosAgrupados){

            let producto = productosAgrupados[nombre];

            console.log(
                `${producto.cantidad} x ${nombre} - $${producto.precio}`
            );

        }

        console.log("--------------------");
        console.log("TOTAL: $" + this.total.toFixed(2));
        console.log("--------------------");

    }

}