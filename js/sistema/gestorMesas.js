class GestorMesas {

    constructor() {
        this.mesas = [];
    }

    crearMesas(cantidad) {
        for (let i = 1; i <= cantidad; i++) {
            this.mesas.push(new Mesa(i));
        }
    }


    obtenerMesa(numero) {
        return this.mesas.find(
            mesa => mesa.numero === numero
        );
    }

    ocuparMesa(numero, pedido) {
        const mesa = this.obtenerMesa(numero);
        if (mesa !== undefined) {
            mesa.ocupar(pedido);
        }
    }

    liberarMesa(numero) {
        const mesa = this.obtenerMesa(numero);
        if (mesa !== undefined) {
            mesa.liberar();
        }
    }

    obtenerMesasLibres() {
        return this.mesas.filter(
            mesa => mesa.estado === "Libre"
        );
    }

    obtenerMesasOcupadas() {
        return this.mesas.filter(
            mesa => mesa.estado === "Ocupada"
        );
    }

    mostrarMesas() {
        console.log("===== MESAS =====");
        this.mesas.forEach(mesa => {

            console.log(
                mesa.mostrarEstado()
            );
        });
    }

}