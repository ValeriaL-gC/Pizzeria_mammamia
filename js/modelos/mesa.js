class Mesa {

    constructor(numero) {

        this.numero = numero;
        this.estado = "Libre";
        this.pedidoActual = null;

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