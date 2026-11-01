class Mesa {

    constructor(numero) {

        this.numero = numero;
        this.estado = "Libre";
        this.pedidoActual = null;

        // Tandas anteriores: pedidos ya enviados a cocina
        // (historial de la mesa). Cada elemento es un Pedido.
        this.tandas = [];

    }

    ocupar(pedido) {

        this.estado = "Ocupada";
        this.pedidoActual = pedido;

    }

    liberar() {

        this.estado = "Libre";
        this.pedidoActual = null;

    }

    mostrarEstado() {

        let texto = `Mesa ${this.numero} | Estado: ${this.estado}`;

        if (this.pedidoActual !== null) {
            texto += ` | Pedido: ${this.pedidoActual.estado}`;
        }

        return texto;

    }

}
