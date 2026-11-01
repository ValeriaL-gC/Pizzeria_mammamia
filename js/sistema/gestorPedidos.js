class GestorPedidos {

    constructor(gestorMesas) {

        this.gestorMesas =
            gestorMesas;

        // Lista enlazada:
        // almacena los pedidos activos.

        this.listaPedidos =
            new ListaEnlazada();


        // Contador de pedidos.

        this.siguienteNumeroPedido =
            Number(
                localStorage.getItem("ultimoNumeroPedido") || "0"
            ) + 1;


        // Arreglo: historial TOTAL de productos de TODOS los
        // pedidos que ya fueron enviados a cocina. Es un registro
        // permanente (no se ve afectado por "Deshacer", porque
        // solo se completa cuando el pedido ya quedó bloqueado).

        this.historialProductosTotal =
            [];

    }



    // CREAR PEDIDO

    crearPedido(numeroMesa) {

        const mesa =
            this.gestorMesas.obtenerMesa(
                numeroMesa
            );


        if (mesa === undefined) {

            console.log(
                "La mesa no existe."
            );

            return null;

        }


        // Solo se bloquea la creación si la mesa ya tiene un
        // pedido en preparación (estado "Creado"). Si el pedido
        // anterior ya fue enviado a cocina, se permite iniciar
        // una nueva tanda para la misma mesa.

        if (
            mesa.pedidoActual !== null &&
            mesa.pedidoActual.estado === "Creado"
        ) {

            console.log(
                "Ya existe un pedido en preparación para esta mesa."
            );

            return null;

        }


        // Crear pedido.

        const pedido =
            new Pedido(
                this.siguienteNumeroPedido,
                mesa
            );


        // Guardar en lista enlazada.

        this.listaPedidos.insertar(
            pedido
        );


        // Vincular el pedido a la mesa sin cambiar su estado:
        // la mesa permanece "Libre" hasta que el pedido se
        // confirme al enviarlo a cocina.
        mesa.pedidoActual = pedido;


        this.siguienteNumeroPedido++;

        localStorage.setItem(
            "ultimoNumeroPedido",
            this.siguienteNumeroPedido - 1
        );

        console.log(
            `Pedido #${pedido.numeroPedido} creado para la mesa ${mesa.numero}.`
        );


        return pedido;

    }



    // AGREGAR PRODUCTO

    agregarProducto(
        numeroPedido,
        producto
    ) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );


        if (pedido == null) {

            console.log(
                "Pedido no encontrado."
            );

            return;

        }


        // Un pedido ya enviado a cocina
        // no se puede seguir modificando.

        if (pedido.estado !== "Creado") {
            return;
        }


        pedido.agregarProducto(
            producto
        );


        // Guardar acción en la pila
        // PROPIA de este pedido.

        pedido.historialAcciones.push({

            accion: "Agregar",

            producto: producto

        });


        console.log(
            producto.nombre +
            " agregado al pedido."
        );

    }



    // ELIMINAR (RESTAR) UNA UNIDAD DE PRODUCTO

    eliminarProducto(
        numeroPedido,
        nombreProducto
    ) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );


        if (pedido == null) {
            return;
        }


        if (pedido.estado !== "Creado") {
            return;
        }


        const producto =
            pedido.productos.find(
                p =>
                    p.nombre ===
                    nombreProducto
            );


        if (producto == null) {
            return;
        }


        pedido.eliminarProducto(
            nombreProducto
        );


        // Guardar acción en la pila
        // PROPIA de este pedido.

        pedido.historialAcciones.push({

            accion: "Eliminar",

            producto: producto

        });

    }


    // ELIMINAR TODAS LAS UNIDADES DE UN PRODUCTO
    // (botón de basurero)

    eliminarProductoCompleto(
        numeroPedido,
        nombreProducto
    ) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );


        if (pedido == null) {
            return;
        }


        if (pedido.estado !== "Creado") {
            return;
        }


        const eliminados =
            pedido.eliminarProductoCompleto(
                nombreProducto
            );


        if (eliminados.length === 0) {
            return;
        }


        // Guardar acción en la pila
        // PROPIA de este pedido (una sola
        // acción con todas las unidades
        // eliminadas, para deshacer de un
        // solo golpe).

        pedido.historialAcciones.push({

            accion: "EliminarTodo",

            productos: eliminados

        });

    }



    // DESHACER (sobre el pedido activo)

    deshacer(numeroPedido) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );


        if (pedido == null) {
            return;
        }


        // Solo se puede deshacer mientras el
        // pedido no se haya enviado a cocina.

        if (pedido.estado !== "Creado") {

            console.log(
                "El pedido ya está en cocina, no se puede deshacer."
            );

            return;

        }


        if (
            pedido.historialAcciones.estaVacia()
        ) {

            console.log(
                "No existen acciones para deshacer."
            );

            return;

        }


        const accion =
            pedido.historialAcciones.pop();


        // Si la última acción fue agregar,
        // se elimina el producto.

        if (
            accion.accion ===
            "Agregar"
        ) {

            pedido.eliminarProducto(
                accion.producto.nombre
            );

        }


        // Si la última acción fue eliminar
        // (restar una unidad), se vuelve a
        // agregar esa unidad.

        else if (
            accion.accion ===
            "Eliminar"
        ) {

            pedido.agregarProducto(
                accion.producto
            );

        }


        // Si la última acción fue eliminar
        // TODO un producto, se restauran
        // todas las unidades eliminadas.

        else if (
            accion.accion ===
            "EliminarTodo"
        ) {

            accion.productos.forEach(
                producto => {

                    pedido.agregarProducto(
                        producto
                    );

                }
            );

        }


        console.log(
            "Se deshizo la última acción."
        );

    }


    // CANCELAR PEDIDO (CRUD: "Creado")
    // Elimina el nodo de la lista enlazada listaPedidos,
    // libera la mesa (estado "Libre") y limpia sus datos.
    // Solo válido en estado "Creado".

    cancelarPedido(numeroPedido) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );

        if (pedido == null) {
            return false;
        }

        if (pedido.estado !== "Creado") {
            return false;
        }

        // Eliminar el nodo de la lista enlazada.
        this.listaPedidos.eliminar(
            numeroPedido
        );

        // Liberar la mesa y limpiar sus datos.
        const mesa = pedido.mesa;

        if (mesa) {

            mesa.liberar();

            mesa.tandas = [];

        }

        console.log(
            `Pedido #${numeroPedido} cancelado y eliminado.`
        );

        return true;

    }


    // MOSTRAR PRODUCTOS DEL PEDIDO

    mostrarProductosPedido(
        numeroPedido
    ) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );


        if (pedido == null) {

            console.log(
                "Pedido no encontrado."
            );

            return;

        }


        console.log(
            "===== PRODUCTOS DEL PEDIDO ====="
        );


        pedido.productos.forEach(
            producto => {

                console.log(
                    producto.nombre +
                    " - $" +
                    producto.precio
                );

            }
        );


        console.log(
            "TOTAL: $" +
            pedido.total
        );

    }


    // ENVIAR A COCINA

    enviarACocina(
        numeroPedido,
        gestorCocina
    ) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );


        if (pedido == null) {

            console.log(
                "Pedido no encontrado."
            );

            return;

        }


        // A partir de aquí el pedido queda
        // bloqueado: ya no se puede modificar
        // ni deshacer ninguna acción sobre él.

        pedido.tiempoTotalPreparacion =
            pedido.calcularTiempoTotal();

        pedido.horaEnvioCocina =
            Date.now();


        // Se guarda un registro permanente
        // (arreglo) con todos los productos de
        // este pedido, independiente de la
        // lista editable. Este registro nunca
        // se ve afectado por "Deshacer".

        pedido.productos.forEach(producto => {

            this.historialProductosTotal.push({

                numeroPedido: pedido.numeroPedido,

                mesa: pedido.mesa.numero,

                producto: producto.nombre,

                precio: producto.precio,

                fecha: new Date().toLocaleString("es-EC")

            });

        });


        gestorCocina.recibirPedido(
            pedido
        );


        console.log(
            `Pedido #${numeroPedido} enviado a cocina.`
        );

    }



    // COBRAR PEDIDO

    cobrarPedido(numeroPedido) {

        const pedido =
            this.listaPedidos.buscar(
                numeroPedido
            );


        if (pedido == null) {

            console.log(
                "Pedido no encontrado."
            );

            return;

        }


        pedido.estado =
            "Pagado";


        console.log(
            "========== FACTURA =========="
        );


        pedido.mostrarPedido();


        console.log(
            "Total a pagar: $" +
            pedido.total.toFixed(2)
        );


        // Liberar mesa.

        this.gestorMesas.liberarMesa(
            pedido.mesa.numero
        );


        // Eliminar pedido de la
        // lista enlazada.

        this.listaPedidos.eliminar(
            numeroPedido
        );


        console.log(
            "Pedido pagado correctamente."
        );

    }



    // BUSCAR PEDIDO

    buscarPedido(numeroPedido) {

        return this.listaPedidos.buscar(
            numeroPedido
        );

    }


    // MOSTRAR PEDIDOS
    mostrarPedidos() {

        console.log(
            "===== PEDIDOS ACTIVOS ====="
        );


        const pedidos =
            this.listaPedidos.recorrer();


        if (
            pedidos.length === 0
        ) {

            console.log(
                "No existen pedidos."
            );

            return;

        }


        pedidos.forEach(
            pedido => {

                pedido.mostrarPedido();

            }
        );

    }

}