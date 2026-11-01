class GestorCocina {

    constructor() {

        // Cola: pedidos esperando a ser preparados (FIFO).
        this.colaPedidos = new Cola();

        // Solo un pedido se prepara a la vez, respetando el orden de llegada.
        this.pedidoEnPreparacion = null;

        this.temporizador = null;

        this.onCambio = null;

    }

    recibirPedido(pedido) {

        pedido.estado = "En espera";

        this.colaPedidos.enqueue(pedido);

        console.log(
            `Pedido #${pedido.numeroPedido} enviado a cocina.`
        );

        this._notificar();

        this._procesarSiguiente();

    }

    // Toma el siguiente pedido de la cola (si no hay ya uno preparándose) y simula el tiempo de preparación con
    // setTimeout, usando el tiempo total del pedido.
    _procesarSiguiente() {

        if (this.pedidoEnPreparacion !== null) {
            return;
        }

        if (this.colaPedidos.estaVacia()) {
            return;
        }

        const pedido = this.colaPedidos.dequeue();

        pedido.estado = "Preparando";

        this.pedidoEnPreparacion = pedido;

        this._notificar();

        // 1 minuto de preparación del pedido = 1 segundo real,
        // para poder ver el ciclo completo dentro del sistema.
        const duracionMs =
            Math.max(pedido.tiempoTotalPreparacion, 1) * 1000;

        this.temporizador = setTimeout(() => {

            pedido.estado = "Listo";

            pedido.horaListo = Date.now();

            this.pedidoEnPreparacion = null;

            this.temporizador = null;

            console.log(
                `Pedido #${pedido.numeroPedido} preparado correctamente.`
            );

            this._notificar();

            this._procesarSiguiente();

        }, duracionMs);

    }


    eliminarPedidoDeCola(numeroPedido) {

        const items =
            this.colaPedidos.items;

        const indice =
            items.findIndex(
                pedido =>
                    pedido.numeroPedido ===
                    numeroPedido
            );

        if (indice !== -1) {
            items.splice(indice, 1);
        }

        if (
            this.pedidoEnPreparacion !== null &&
            this.pedidoEnPreparacion.numeroPedido ===
                numeroPedido
        ) {

            if (this.temporizador !== null) {
                clearTimeout(this.temporizador);
                this.temporizador = null;
            }

            this.pedidoEnPreparacion = null;

            this._procesarSiguiente();

        }

        this._notificar();

    }

    _notificar() {

        if (typeof this.onCambio === "function") {
            this.onCambio();
        }

    }


    obtenerPedidosActivos() {

        const enEspera = this.colaPedidos.mostrar();

        const activos = [];

        if (this.pedidoEnPreparacion !== null) {
            activos.push(this.pedidoEnPreparacion);
        }

        return activos.concat(enEspera);

    }

    mostrarCola() {

        console.log("===== COLA DE COCINA =====");

        this.obtenerPedidosActivos().forEach(pedido => {

            console.log(
                `Pedido ${pedido.numeroPedido}\nMesa ${pedido.mesa.numero}\nEstado ${pedido.estado}`
            );

        });

    }

}
