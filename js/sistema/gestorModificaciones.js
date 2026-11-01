class GestorModificaciones {

    constructor(gestorPedidos, gestorCocina, gestorMenu) {

        this.gestorPedidos =
            gestorPedidos;

        this.gestorCocina =
            gestorCocina;

        this.gestorMenu = 
            gestorMenu;

        // Cola de Solicitudes/Modificaciones (FIFO):
        // los pedidos de mesa en estado "En espera" NO se
        // modifican directamente; sus cambios se encolan aquí
        // y la cocina/mesero los acepta o rechaza.
        this.colaModificaciones =
            new Cola();

        // Función que la interfaz puede asignar para
        // enterarse cuando cambia la cola o se aplica
        // una solicitud.
        this.onCambio = null;

    }



    // ENCOLAR SOLICITUD
    // Crea un objeto de Solicitud
    // { numeroPedido, tipo, detalle } y lo encola.
    // tipos: "agregar" | "eliminar_prod" | "cancelacion".

    solicitarModificacion({
        numeroPedido,
        tipo,
        detalle
    }) {

        const pedido =
            this.gestorPedidos.buscarPedido(
                numeroPedido
            );

        if (pedido == null) {
            return null;
        }

        // Solo los pedidos de mesa "En espera" admiten
        // solicitudes (los "Creado" se editan directo y
        // los "Preparando"/"Listo" están bloqueados).
        if (pedido.estado !== "En espera") {
            return null;
        }

        const solicitud = {

            id:
                Date.now() +
                "-" +
                numeroPedido,

            numeroPedido:
                numeroPedido,

            tipo:
                tipo,

            detalle:
                detalle || {},

            mesa:
                pedido.mesa
                    ? pedido.mesa.numero
                    : null,

            cliente:
                pedido.nombreCliente || "",

            fecha:
                new Date().toLocaleString("es-EC")

        };

        this.colaModificaciones.enqueue(
            solicitud
        );

        console.log(
            `Solicitud "${tipo}" encolada para el pedido #${numeroPedido}.`
        );

        this._notificar();

        return solicitud;

    }


    // VER SOLICITUDES PENDIENTES
    obtenerSolicitudes() {

        return this.colaModificaciones.mostrar();

    }


    // PROCESAR PRIMERA SOLICITUD (FIFO)

    procesarSiguiente() {

        const solicitud =
            this.colaModificaciones.dequeue();

        if (solicitud == null) {
            return null;
        }

        return this._aplicar(solicitud);

    }


    // PROCESAR SOLICITUD ESPECÍFICA
    // Aceptar/Procesar la solicitud elegida de la
    // cola y aplicar sus efectos al pedido.

    procesarSolicitud(indice) {

        const items =
            this.colaModificaciones.items;

        if (
            indice < 0 ||
            indice >= items.length
        ) {
            return null;
        }

        const [solicitud] =
            items.splice(indice, 1);

        return this._aplicar(solicitud);

    }


    // RECHAZAR SOLICITUD (sin aplicarla)

    rechazarSolicitud(indice) {

        const items =
            this.colaModificaciones.items;

        if (
            indice < 0 ||
            indice >= items.length
        ) {
            return null;
        }

        const [solicitud] =
            items.splice(indice, 1);

        console.log(
            `Solicitud del pedido #${solicitud.numeroPedido} rechazada.`
        );

        this._notificar();

        return solicitud;

    }


    // APLICAR SOLICITUD
    _aplicar(solicitud) {

        const pedido =
            this.gestorPedidos.buscarPedido(
                solicitud.numeroPedido
            );

        if (pedido == null) {

            this._notificar();

            return {
                solicitud: solicitud,
                aplicada: false,
                motivo:
                    "El pedido ya no existe."
            };

        }

        // Bloqueo estricto: aunque la solicitud se creó en
        // "En espera", si el pedido ya pasó a "Preparando" o
        // "Listo" mientras esperaba, NO se puede aplicar.
        if (
            pedido.estado === "Preparando" ||
            pedido.estado === "Listo"
        ) {

            this._notificar();

            return {
                solicitud: solicitud,
                aplicada: false,
                motivo:
                    "El pedido ya está siendo preparado o listo y no se puede modificar ni cancelar."
            };

        }


        // ----------
        // AGREGAR
        // ----------

        if (
            solicitud.tipo === "agregar"
        ) {

            const producto =
                this.gestorMenu.obtenerProductoPorNombre(
                    solicitud.detalle.nombre
                );

            const cantidad =
                Number(solicitud.detalle.cantidad) || 1;

            if (producto) {

                for (
                    let i = 0;
                    i < cantidad;
                    i++
                ) {

                    pedido.agregarProducto(
                        producto
                    );

                }

            }

        }


        // ----------
        // ELIMINAR PRODUCTO
        // ----------

        else if (
            solicitud.tipo === "eliminar_prod"
        ) {

            let cantidad =
                Number(solicitud.detalle.cantidad) || 1;

            while (cantidad > 0) {

                pedido.eliminarProducto(
                    solicitud.detalle.nombre
                );

                cantidad--;

            }

        }


        // ----------
        // CANCELACIÓN
        // ----------

        else if (
            solicitud.tipo === "cancelacion"
        ) {

            // El pedido pasa a "Cancelado".
            pedido.estado = "Cancelado";

            // Se elimina de la lista enlazada y de la
            // cola de cocina (deja de ser un pedido activo).
            this.gestorPedidos.listaPedidos.eliminar(
                solicitud.numeroPedido
            );

            this.gestorCocina.eliminarPedidoDeCola(
                solicitud.numeroPedido
            );

            // Se limpia la mesa.
            const mesa = pedido.mesa;

            if (mesa) {

                mesa.liberar();

                mesa.tandas = [];

            }

        }


        console.log(
            `Solicitud "${solicitud.tipo}" del pedido #${solicitud.numeroPedido} aplicada.`
        );

        this._notificar();

        return {
            solicitud: solicitud,
            aplicada: true
        };

    }


    _notificar() {

        if (
            typeof this.onCambio === "function"
        ) {
            this.onCambio();
        }

    }

}
