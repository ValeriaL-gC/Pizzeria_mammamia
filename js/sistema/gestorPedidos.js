class GestorPedidos {

    constructor(gestorMesas) {
        this.gestorMesas = gestorMesas;
        this.listaPedidos = new ListaEnlazada();
        this.siguienteNumeroPedido = 1;
    }

    crearPedido(numeroMesa) {

        // Buscar la mesa
        const mesa = this.gestorMesas.obtenerMesa(numeroMesa);
        if (mesa === undefined) {
            console.log("La mesa no existe.");
            return null;
        }

        // Verificar que esté libre
        if (mesa.estado === "Ocupada") {
            console.log("La mesa ya está ocupada.");
            return null;
        }

        // Crear el pedido
        const pedido = new Pedido(
            this.siguienteNumeroPedido,
            mesa
        );

        // Guardarlo en la lista enlazada
        this.listaPedidos.insertar(pedido);

        // Ocupar la mesa utilizando el Gestor de Mesas
        this.gestorMesas.ocuparMesa(numeroMesa, pedido);

        // Incrementar el contador
        this.siguienteNumeroPedido++;

        console.log(
            `Pedido #${pedido.numeroPedido} creado para la mesa ${mesa.numero}.`
        );
        return pedido;

    }

    buscarPedido(numeroPedido) {
        return this.listaPedidos.buscar(numeroPedido);
    }

    mostrarPedidos() {

        console.log("===== PEDIDOS ACTIVOS =====");
        const pedidos = this.listaPedidos.recorrer();

        if (pedidos.length === 0) {
            console.log("No existen pedidos.");
            return;
        }

        pedidos.forEach(pedido => {
            pedido.mostrarPedido();
        });

    }

}