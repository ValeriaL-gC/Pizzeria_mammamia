
// SISTEMA DE GESTIÓN - PIZZERÍA MAMMA MIA

// GESTORES PRINCIPALES
const gestorMesas = new GestorMesas();

const gestorPedidos = new GestorPedidos(
    gestorMesas
);

const gestorMenu = new GestorMenu();

const gestorCocina = new GestorCocina();

const gestorModificaciones = new GestorModificaciones(
    gestorPedidos,
    gestorCocina,
    gestorMenu
);

const gestorVentas = new GestorVentas();


// VARIABLES DE ESTADO

let mesaActual = null;
let pedidoActual = null;

let categoriaActual = "todas";

let pedidosOnline = [];


let rolActivo =
    sessionStorage.getItem("rolActivo") || null;

let usuarioActivo =
    sessionStorage.getItem("usuarioActivo") || null;


const CLAVE_ADMIN = "5678";

// Pedido cuyo detalle de tiempos se está mostrando (modal).
let pedidoDetalleActual = null;

// Mensaje de bloqueo estricto para pedidos en
// "Preparando" o "Listo".
const MSG_PEDIDO_BLOQUEADO =
    "El pedido ya está siendo preparado o listo y no se puede modificar ni cancelar.";



// INICIALIZACIÓN


document.addEventListener("DOMContentLoaded", () => {

    inicializarSistema();

    configurarEventos();

    mostrarSesionActiva();

    mostrarMesas();

    mostrarMenu();

    mostrarPedidosOnline();

    mostrarListaEspera();

    mostrarColaModificaciones();

    actualizarVentas();

    // Cuando la cocina cambia de estado (nuevo pedido,
    // empieza a prepararse, queda listo) se refresca la
    // lista de espera, el panel de mesas y, si corresponde,
    // el pedido que se está viendo en pantalla.
    gestorCocina.onCambio = function () {

        mostrarListaEspera();

        mostrarMesas();

        if (pedidoActual) {
            mostrarPedido();
            actualizarCabeceraMesa();
        }

        if (
            pedidoDetalleActual &&
            !document.getElementById("modalDetallePedido").classList.contains("oculto")
        ) {
            mostrarDetallePedido(pedidoDetalleActual.numeroPedido);
        }

    };

    // Cuando cambia la cola de solicitudes de modificación
    // (nueva solicitud, solicitud aceptada/rechazada) se
    // refresca la cola, el panel de mesas y el pedido activo.
    gestorModificaciones.onCambio = function () {

        mostrarColaModificaciones();

        mostrarMesas();

        if (pedidoActual) {

            mostrarPedido();

            actualizarCabeceraMesa();

        }

    };

});

// SESIÓN ACTIVA

function mostrarSesionActiva() {

    const texto =
        document.getElementById("sesionActivaTexto");

    if (!texto) {
        return;
    }

    if (!rolActivo || !usuarioActivo) {
        texto.textContent = "Invitado";
        return;
    }

    const etiquetaRol =
        rolActivo === "admin" ? "Administrador" : "Mesero";

    texto.textContent =
        `${usuarioActivo} · ${etiquetaRol}`;

}


// INICIALIZAR SISTEMA

function inicializarSistema() {

    // Crear las 10 mesas
    gestorMesas.crearMesas(10);

    // Cargar productos
    gestorMenu.cargarProductos();

    // Crear árbol del menú
    gestorMenu.arbol =
        gestorMenu.crearArbolMenu();

    // Crear grafo de productos relacionados
    gestorMenu.crearGrafoProductos();

}


// MESAS

function mostrarMesas() {

    const contenedor =
        document.getElementById("mesas");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    gestorMesas.mesas.forEach(mesa => {

        const boton =
            document.createElement("button");

        boton.className =
            "mesa-boton";

        if (
            mesa.estado === "Ocupada"
        ) {

            boton.classList.add(
                "mesa-ocupada"
            );

        }

        else {

            boton.classList.add(
                "mesa-libre"
            );

        }

        if (
            mesaActual !== null &&
            mesa.numero === mesaActual.numero
        ) {

            boton.classList.add("seleccionada");

        }

        boton.innerHTML = `
            <i class="fa-solid fa-chair"></i>
            Mesa ${mesa.numero}
            <small>${mesa.estado}</small>
        `;

        boton.addEventListener(
            "click",
            () => {

                seleccionarMesa(
                    mesa.numero
                );

            }
        );

        contenedor.appendChild(boton);

    });

}


// SELECCIONAR MESA

function seleccionarMesa(numeroMesa) {

    const mesa =
        gestorMesas.obtenerMesa(numeroMesa);

    if (!mesa) {
        return;
    }

    mesaActual = mesa;


    // Si ya existe un pedido, recuperarlo
    if (mesa.pedidoActual !== null) {

        pedidoActual =
            mesa.pedidoActual;

    }

    else {

        // Crear nuevo pedido
        pedidoActual =
            gestorPedidos.crearPedido(
                numeroMesa
            );

    }


    if (!pedidoActual) {
        return;
    }


    mostrarPedido();

    document
        .getElementById("vistaMesas")
        .classList.add("oculto");

    document
        .getElementById("vistaPedido")
        .classList.remove("oculto");

    actualizarCabeceraMesa();

}


// CABECERA DE MESA

function actualizarCabeceraMesa() {

    if (!mesaActual) {
        return;
    }

    document.getElementById(
        "numeroMesaActual"
    ).textContent =
        `Mesa ${mesaActual.numero}`;

    document.getElementById(
        "estadoMesaActual"
    ).textContent =
        mesaActual.estado;

    document.getElementById(
        "estadoMesaActual"
    ).className =
        `estado-mesa ${
            mesaActual.estado === "Ocupada"
                ? "ocupada"
                : ""
        }`;

}


// VOLVER A MESAS

function volverMesas() {

    document
        .getElementById("vistaPedido")
        .classList.add("oculto");

    document
        .getElementById("vistaMesas")
        .classList.remove("oculto");

    mesaActual = null;
    pedidoActual = null;

    mostrarMesas();

}



// MENÚ

function mostrarMenu() {

    const contenedor =
        document.getElementById("menu");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    let productos =
        [...gestorMenu.menu];



    // FILTRO POR CATEGORÍA

    if (categoriaActual !== "todas") {

        productos =
            productos.filter(
                producto =>
                    producto.categoria ===
                    categoriaActual
            );

    }


    // BUSCADOR

    const buscador =
        document.getElementById(
            "buscarMenu"
        );

    const texto =
        buscador
            ? buscador.value.toLowerCase()
            : "";


    if (texto !== "") {

        productos =
            productos.filter(
                producto =>
                    producto.nombre
                        .toLowerCase()
                        .includes(texto)
            );

    }



    // TARJETAS

    productos.forEach(producto => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "producto-tarjeta";

        tarjeta.innerHTML = `

            <div class="producto-info">

                <strong>
                    ${producto.nombre}
                </strong>

                <span class="producto-categoria">
                    ${producto.categoria}
                </span>

                <span class="producto-precio">
                    $${producto.precio.toFixed(2)}
                </span>

            </div>

            <button
                class="btn-agregar"
                data-id="${producto.id}"
            >
                <i class="fa-solid fa-plus"></i>
                Agregar
            </button>

        `;


        tarjeta
            .querySelector(".btn-agregar")
            .addEventListener(
                "click",
                () => {

                    agregarProducto(
                        producto.id
                    );

                }
            );


        contenedor.appendChild(
            tarjeta
        );

    });

}


// AGREGAR PRODUCTO

function agregarProducto(idProducto) {

    if (!pedidoActual) {
        return;
    }

    const estado =
        pedidoActual.estado;

    // "Preparando" o "Listo": bloqueo estricto.
    if (
        estado === "Preparando" ||
        estado === "Listo"
    ) {

        alert(
            MSG_PEDIDO_BLOQUEADO
        );

        return;

    }

    const producto =
        gestorMenu.obtenerProducto(
            idProducto
        );

    if (!producto) {
        return;
    }

    // "Creado": CRUD completo directo (local).
    if (estado === "Creado") {

        gestorPedidos.agregarProducto(
            pedidoActual.numeroPedido,
            producto
        );

        mostrarPedido();

        mostrarRelacionados(
            producto.nombre
        );

        return;

    }

    // "En espera": no se modifica el pedido original;
    // se encola una solicitud en la cola de modificaciones.
    if (estado === "En espera") {

        gestorModificaciones.solicitarModificacion({
            numeroPedido: pedidoActual.numeroPedido,
            tipo: "agregar",
            detalle: {
                nombre: producto.nombre,
                cantidad: 1
            }
        });

        mostrarPedido();

        mostrarColaModificaciones();

        alert(
            `Solicitud encolada: agregar "${producto.nombre}".\n` +
            "La cocina debe aceptarla para aplicarla."
        );

    }

}

// MOSTRAR PEDIDO

function mostrarPedido() {

    if (!pedidoActual) {
        return;
    }

    const contenedor =
        document.getElementById("pedido");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";


    // El pedido queda bloqueado apenas se envía a cocina.
    const bloqueado =
        pedidoActual.estado !== "Creado";

    // "En espera": solo se modifica mediante solicitudes
    // encoladas que la cocina/mesero debe aceptar.
    const enEspera =
        pedidoActual.estado === "En espera";

    // "Preparando" y "Listo": bloqueo estricto.
    const bloqueoEstricto =
        pedidoActual.estado === "Preparando" ||
        pedidoActual.estado === "Listo";



    // DATOS DEL CLIENTE

    const nombreCliente =
        document.getElementById(
            "nombreCliente"
        );

    const numeroPersonas =
        document.getElementById(
            "numeroPersonas"
        );


    if (nombreCliente) {

        nombreCliente.value =
            pedidoActual.nombreCliente || "";

    }


    if (numeroPersonas) {

        numeroPersonas.value =
            pedidoActual.numeroPersonas || "";

    }

    if (nombreCliente) {
        nombreCliente.disabled = bloqueado;
    }

    if (numeroPersonas) {
        numeroPersonas.disabled = bloqueado;
    }


    // ----------------------------------------
    // BOTONES DE ACCIÓN SEGÚN EL ESTADO
    // ----------------------------------------

    const mesa = pedidoActual.mesa;

    const tandas =
        (mesa && mesa.tandas) ?
            mesa.tandas :
            [];

    const btnDeshacer =
        document.getElementById("btnDeshacer");

    const btnEnviar =
        document.getElementById("btnEnviar");

    const btnCobrar =
        document.getElementById("btnCobrar");

    const btnNuevaTanda =
        document.getElementById("btnNuevaTanda");

    if (btnDeshacer) {

        btnDeshacer.disabled =
            bloqueado ||
            pedidoActual.historialAcciones.estaVacia();

    }

    if (btnEnviar) {
        btnEnviar.disabled = bloqueado;
    }

    // Cobrar solo cuando TODOS los pedidos de la mesa
    // (tandas anteriores + el actual) están "Listo".
    if (btnCobrar) {

        const todosLosPedidos =
            tandas.concat([pedidoActual]);

        btnCobrar.disabled =
            !todosLosPedidos.every(
                p => p.estado === "Listo"
            );

    }

    // La nueva tanda se habilita cuando el pedido actual ya
    // fue enviado a cocina (dejó de estar en "Creado").
    if (btnNuevaTanda) {

        btnNuevaTanda.classList.toggle(
            "oculto",
            pedidoActual.estado === "Creado"
        );

    }

    // Cancelar pedido: directo en "Creado", mediante solicitud
    // en "En espera". Oculto en "Preparando"/"Listo".
    const btnCancelar =
        document.getElementById("btnCancelarPedido");

    if (btnCancelar) {

        const cancelable =
            pedidoActual.estado === "Creado" ||
            enEspera;

        btnCancelar.classList.toggle(
            "oculto",
            !cancelable
        );

    }


    // ----------------------------------------
    // TANDAS ANTERIORES (pedidos ya preparados)
    // ----------------------------------------

    tandas.forEach(tanda => {

        const seccion =
            document.createElement("div");

        seccion.className = "tanda-seccion";

        const agrupadosTanda = {};

        tanda.productos.forEach(producto => {

            if (
                !agrupadosTanda[producto.nombre]
            ) {

                agrupadosTanda[
                    producto.nombre
                ] = {

                    producto: producto,
                    cantidad: 0

                };

            }

            agrupadosTanda[
                producto.nombre
            ].cantidad++;

        });

        let productosTandaHTML = "";

        for (
            const nombre in agrupadosTanda
        ) {

            const item =
                agrupadosTanda[nombre];

            productosTandaHTML +=
                `<div class="detalle-producto-fila">` +
                `<span>${item.cantidad} x ${item.producto.nombre}</span>` +
                `<span>$${(item.producto.precio * item.cantidad).toFixed(2)}</span>` +
                `</div>`;

        }

        seccion.innerHTML =
            `<div class="tanda-titulo">` +
                `<strong><i class="fa-solid fa-receipt"></i> Pedido #${tanda.numeroPedido} — ${tanda.estado}</strong>` +
                `<span class="tanda-subtotal">$${tanda.total.toFixed(2)}</span>` +
            `</div>` +
            (productosTandaHTML ||
                `<p class="pedido-vacio">Sin productos.</p>`);

        contenedor.appendChild(seccion);

    });


    // ----------------------------------------
    // PEDIDO ACTUAL
    // ----------------------------------------

    if (
        pedidoActual.productos.length === 0
    ) {

        const vacio =
            document.createElement("p");

        vacio.className = "pedido-vacio";

        vacio.textContent =
            "No hay productos en el pedido.";

        contenedor.appendChild(vacio);

    }


    // ----------------------------------------
    // AGRUPAR PRODUCTOS
    // ----------------------------------------

    const agrupados = {};


    pedidoActual.productos.forEach(
        producto => {

            if (
                !agrupados[producto.nombre]
            ) {

                agrupados[
                    producto.nombre
                ] = {

                    producto: producto,
                    cantidad: 0

                };

            }

            agrupados[
                producto.nombre
            ].cantidad++;

        }
    );


    // ----------------------------------------
    // ENCABEZADO DE ESTADO (si ya fue enviado)
    // ----------------------------------------

    if (bloqueado) {

        const aviso =
            document.createElement("p");

        aviso.className = "pedido-vacio";

        if (bloqueoEstricto) {

            aviso.textContent =
                MSG_PEDIDO_BLOQUEADO;

        }

        else if (enEspera) {

            aviso.textContent =
                `El pedido está "En espera". Para modificar o cancelar, crea una solicitud en la cola de modificaciones.`;

        }

        else {

            aviso.textContent =
                `Pedido en estado "${pedidoActual.estado}". Ya no se puede modificar.`;

        }

        contenedor.appendChild(aviso);

    }


    // ----------------------------------------
    // MOSTRAR PRODUCTOS
    // ----------------------------------------

    for (
        const nombre in agrupados
    ) {

        const item =
            agrupados[nombre];

        const fila =
            document.createElement("div");

        fila.className =
            "producto-tarjeta";

        // "Creado": controles de CRUD directo.
        // "En espera": controles que encolan solicitudes.
        // "Preparando"/"Listo": solo se muestra información.
        let controlesHTML;

        if (pedidoActual.estado === "Creado") {

            controlesHTML =
                `<div class="controles-cantidad">
                   <button class="btn-restar" title="Quitar una unidad">
                       <i class="fa-solid fa-minus"></i>
                   </button>
                   <span>${item.cantidad}</span>
                   <button class="btn-sumar" title="Agregar una unidad">
                       <i class="fa-solid fa-plus"></i>
                   </button>
               </div>
               <button class="btn-eliminar" title="Eliminar producto del pedido">
                   <i class="fa-solid fa-trash"></i>
               </button>`;

        }

        else if (enEspera) {

            controlesHTML =
                `<div class="controles-cantidad">
                   <button class="btn-restar" title="Solicitar quitar una unidad">
                       <i class="fa-solid fa-minus"></i>
                   </button>
                   <span>${item.cantidad}</span>
                   <button class="btn-sumar" title="Solicitar agregar una unidad">
                       <i class="fa-solid fa-plus"></i>
                   </button>
               </div>
               <button class="btn-eliminar" title="Solicitar eliminar producto">
                   <i class="fa-solid fa-trash"></i>
               </button>`;

        }

        else {

            controlesHTML =
                `<span class="badge-tiempo">
                   <i class="fa-solid fa-clock"></i>
                   ${item.producto.tiempoPreparacion} min c/u
               </span>`;

        }

        fila.innerHTML = `

            <div class="producto-info">

                <strong>
                    ${item.cantidad} x
                    ${item.producto.nombre}
                </strong>

                <span class="producto-precio">
                    $${(
                        item.producto.precio *
                        item.cantidad
                    ).toFixed(2)}
                </span>

            </div>

            ${controlesHTML}

        `;


        if (pedidoActual.estado === "Creado") {

            fila
                .querySelector(".btn-sumar")
                .addEventListener(
                    "click",
                    () => {
                        aumentarProducto(item.producto);
                    }
                );

            fila
                .querySelector(".btn-restar")
                .addEventListener(
                    "click",
                    () => {
                        disminuirProducto(item.producto.nombre);
                    }
                );

            fila
                .querySelector(".btn-eliminar")
                .addEventListener(
                    "click",
                    () => {
                        eliminarProducto(
                            item.producto.nombre
                        );
                    }
                );

        }

        else if (enEspera) {

            // Los cambios no se aplican directo: se encolan
            // como solicitudes en la cola de modificaciones.
            fila
                .querySelector(".btn-sumar")
                .addEventListener(
                    "click",
                    () => {
                        solicitarModificacionProducto(
                            item.producto.nombre,
                            "agregar",
                            1
                        );
                    }
                );

            fila
                .querySelector(".btn-restar")
                .addEventListener(
                    "click",
                    () => {
                        solicitarModificacionProducto(
                            item.producto.nombre,
                            "eliminar_prod",
                            1
                        );
                    }
                );

            fila
                .querySelector(".btn-eliminar")
                .addEventListener(
                    "click",
                    () => {
                        solicitarModificacionProducto(
                            item.producto.nombre,
                            "eliminar_prod",
                            item.cantidad
                        );
                    }
                );

        }


        contenedor.appendChild(
            fila
        );

    }


    // ----------------------------------------
    // TOTAL
    // ----------------------------------------

    document.getElementById(
        "totalPedido"
    ).textContent =
        `$${pedidoActual.total.toFixed(2)}`;


    // ----------------------------------------
    // TOTAL GENERAL DE LA MESA
    // ----------------------------------------

    const totalGeneral =
        tandas.reduce(
            (suma, tanda) =>
                suma + tanda.total,
            0
        ) + pedidoActual.total;

    const totalGeneralElemento =
        document.getElementById("totalGeneral");

    if (totalGeneralElemento) {

        totalGeneralElemento.textContent =
            `$${totalGeneral.toFixed(2)}`;

    }

}


// MODIFICAR CANTIDAD (actualizar) / ELIMINAR
// "Actualizar/modificar" = cambiar la cantidad de un producto
// ya agregado (+ / -), usando la MISMA instancia del producto.
// "Eliminar" = quitar por completo ese producto del pedido,
// sin importar cuántas unidades tenía.

function aumentarProducto(producto) {

    if (!pedidoActual || pedidoActual.estado !== "Creado") {
        return;
    }

    gestorPedidos.agregarProducto(
        pedidoActual.numeroPedido,
        producto
    );

    mostrarPedido();

}

function disminuirProducto(nombreProducto) {

    if (!pedidoActual || pedidoActual.estado !== "Creado") {
        return;
    }

    gestorPedidos.eliminarProducto(
        pedidoActual.numeroPedido,
        nombreProducto
    );

    mostrarPedido();

}

function eliminarProducto(nombreProducto) {

    if (!pedidoActual || pedidoActual.estado !== "Creado") {
        return;
    }

    gestorPedidos.eliminarProductoCompleto(
        pedidoActual.numeroPedido,
        nombreProducto
    );

    mostrarPedido();

}



// SOLICITUDES DE MODIFICACIÓN / CANCELACIÓN

// "En espera": los cambios se encolan en la cola de
// modificaciones y la cocina/mesero los acepta o rechaza.
// "Preparando"/"Listo": bloqueo estricto.

function solicitarModificacionProducto(nombreProducto, tipo, cantidad) {

    if (!pedidoActual) {
        return;
    }

    if (
        pedidoActual.estado === "Preparando" ||
        pedidoActual.estado === "Listo"
    ) {

        alert(MSG_PEDIDO_BLOQUEADO);

        return;

    }

    if (pedidoActual.estado !== "En espera") {
        return;
    }

    gestorModificaciones.solicitarModificacion({
        numeroPedido: pedidoActual.numeroPedido,
        tipo: tipo,
        detalle: {
            nombre: nombreProducto,
            cantidad: cantidad
        }
    });

    mostrarPedido();

    mostrarColaModificaciones();

    alert(
        `Solicitud encolada: ${tipo === "agregar" ? "agregar" : "quitar"} "${nombreProducto}".\n` +
        "La cocina debe aceptarla para aplicarla."
    );

}


function solicitarCancelacion() {

    if (!pedidoActual) {
        return;
    }

    const estado =
        pedidoActual.estado;

    // Bloqueo estricto.
    if (
        estado === "Preparando" ||
        estado === "Listo"
    ) {

        alert(MSG_PEDIDO_BLOQUEADO);

        return;

    }

    // "Creado": cancelación directa.
    if (estado === "Creado") {

        cancelarPedidoCreado();

        return;

    }

    // "En espera": cancelación mediante solicitud.
    if (estado === "En espera") {

        gestorModificaciones.solicitarModificacion({
            numeroPedido: pedidoActual.numeroPedido,
            tipo: "cancelacion",
            detalle: {
                motivo: "Solicitud de cancelación del cliente"
            }
        });

        mostrarPedido();

        mostrarColaModificaciones();

        alert(
            "Solicitud de cancelación encolada.\n" +
            "La cocina debe aceptarla para cancelar el pedido."
        );

    }

}


function cancelarPedidoCreado() {

    if (!pedidoActual) {
        return;
    }

    if (pedidoActual.estado !== "Creado") {
        return;
    }

    const pedido = pedidoActual;

    if (
        !confirm(
            `¿Seguro que deseas cancelar y eliminar el pedido #${pedido.numeroPedido}?\n` +
            "La mesa quedará libre y se limpiarán sus datos."
        )
    ) {
        return;
    }

    gestorPedidos.cancelarPedido(
        pedido.numeroPedido
    );

    alert(
        `Pedido #${pedido.numeroPedido} cancelado.`
    );

    volverMesas();

    mostrarColaModificaciones();

}


// COLA DE SOLICITUDES / MODIFICACIONES

function mostrarColaModificaciones() {

    const contenedor =
        document.getElementById("colaModificaciones");

    if (!contenedor) {
        return;
    }

    const solicitudes =
        gestorModificaciones.obtenerSolicitudes();

    contenedor.innerHTML = "";

    if (solicitudes.length === 0) {

        contenedor.innerHTML = `
            <p class="pedido-vacio">
                No hay solicitudes pendientes.
            </p>
        `;

        return;

    }

    solicitudes.forEach((solicitud, indice) => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "tarjeta-solicitud";

        const tipoTexto =
            solicitud.tipo === "agregar"
                ? "Agregar producto"
                : solicitud.tipo === "eliminar_prod"
                    ? "Eliminar producto"
                    : "Cancelar pedido";

        const detalleTexto =
            solicitud.tipo === "cancelacion"
                ? (solicitud.detalle.motivo || "Cancelación del pedido")
                : `${solicitud.detalle.cantidad} x ${solicitud.detalle.nombre}`;

        tarjeta.innerHTML = `
            <div class="tarjeta-solicitud-fila">
                <strong>
                    Pedido #${solicitud.numeroPedido}
                    ${solicitud.mesa ? `· Mesa ${solicitud.mesa}` : ""}
                </strong>
                <span class="tipo-solicitud">${tipoTexto}</span>
            </div>
            <div class="tarjeta-solicitud-fila">
                <span>${detalleTexto}</span>
                <span>
                    <i class="fa-solid fa-user"></i>
                    ${solicitud.cliente || "—"}
                </span>
            </div>
            <div class="tarjeta-solicitud-fila">
                <span class="fecha-solicitud">${solicitud.fecha}</span>
                <span class="acciones-solicitud">
                    <button class="btn-aceptar-solicitud">
                        <i class="fa-solid fa-check"></i> Aceptar
                    </button>
                    <button class="btn-rechazar-solicitud">
                        <i class="fa-solid fa-xmark"></i> Rechazar
                    </button>
                </span>
            </div>
        `;

        tarjeta
            .querySelector(".btn-aceptar-solicitud")
            .addEventListener(
                "click",
                () => {
                    procesarSolicitudDesdeUI(indice);
                }
            );

        tarjeta
            .querySelector(".btn-rechazar-solicitud")
            .addEventListener(
                "click",
                () => {
                    rechazarSolicitudDesdeUI(indice);
                }
            );

        contenedor.appendChild(tarjeta);

    });

}


function procesarSolicitudDesdeUI(indice) {

    const resultado =
        gestorModificaciones.procesarSolicitud(indice);

    if (!resultado) {
        return;
    }

    if (!resultado.aplicada && resultado.motivo) {

        alert(resultado.motivo);

    }

    if (
        resultado.aplicada &&
        resultado.solicitud.tipo === "cancelacion"
    ) {

        alert(
            `Pedido #${resultado.solicitud.numeroPedido} cancelado correctamente.`
        );

        // Si se estaba viendo ese pedido, regresar a mesas.
        if (
            pedidoActual &&
            pedidoActual.numeroPedido ===
                resultado.solicitud.numeroPedido
        ) {

            volverMesas();

        }

    }

    mostrarColaModificaciones();

    mostrarMesas();

    mostrarListaEspera();

    if (pedidoActual) {

        mostrarPedido();

        actualizarCabeceraMesa();

    }

}


function rechazarSolicitudDesdeUI(indice) {

    const solicitud =
        gestorModificaciones.rechazarSolicitud(indice);

    if (!solicitud) {
        return;
    }

    mostrarColaModificaciones();

}


// DESHACER

function deshacer() {

    if (!pedidoActual) {
        return;
    }

    gestorPedidos.deshacer(
        pedidoActual.numeroPedido
    );

    pedidoActual =
        gestorPedidos.buscarPedido(
            pedidoActual.numeroPedido
        );

    mostrarPedido();

}


// ENVIAR A COCINA

function enviarACocina() {

    if (!pedidoActual) {
        return;
    }

    if (pedidoActual.estado !== "Creado") {
        return;
    }

    if (!pedidoActual.mesa) {

        alert(
            "Debes seleccionar una mesa antes de enviar el pedido."
        );

        return;

    }

    const nombreClienteInput =
        document.getElementById(
            "nombreCliente"
        );

    const numeroPersonasInput =
        document.getElementById(
            "numeroPersonas"
        );

    const nombreCliente =
        nombreClienteInput
            ? nombreClienteInput.value.trim()
            : "";

    const numeroPersonas =
        parseInt(
            numeroPersonasInput
                ? numeroPersonasInput.value
                : "",
            10
        );

    if (nombreCliente === "") {

        alert(
            "Debes ingresar el nombre del cliente antes de enviar el pedido."
        );

        if (nombreClienteInput) {
            nombreClienteInput.focus();
        }

        return;

    }

    if (
        isNaN(numeroPersonas) ||
        numeroPersonas < 1
    ) {

        alert(
            "Debes indicar el número de personas antes de enviar el pedido."
        );

        if (numeroPersonasInput) {
            numeroPersonasInput.focus();
        }

        return;

    }

    if (
        pedidoActual.productos.length === 0
    ) {

        alert(
            "No puedes enviar un pedido vacío a cocina."
        );

        return;

    }


    guardarDatosCliente();


    // La mesa pasa a "Ocupada" solo cuando el pedido se
    // confirma con los datos del cliente y se envía a cocina.
    gestorMesas.ocuparMesa(
        pedidoActual.mesa.numero,
        pedidoActual
    );


    gestorPedidos.enviarACocina(
        pedidoActual.numeroPedido,
        gestorCocina
    );


    actualizarCabeceraMesa();

    mostrarPedido();

    mostrarListaEspera();


    // Al enviar, solo se informa el TIEMPO TOTAL del pedido
    // (el detalle por producto se consulta luego desde la
    // lista de espera).
    alert(
        `Pedido #${pedidoActual.numeroPedido} enviado a cocina.\n` +
        `Tiempo total estimado: ${pedidoActual.tiempoTotalPreparacion} minutos.`
    );

}


// GUARDAR DATOS DEL CLIENTE

function guardarDatosCliente() {

    if (!pedidoActual) {
        return;
    }

    pedidoActual.nombreCliente =
        document.getElementById(
            "nombreCliente"
        ).value;

    pedidoActual.numeroPersonas =
        parseInt(
            document.getElementById(
                "numeroPersonas"
            ).value
        ) || 1;

}


// NUEVA TANDA DE PEDIDO PARA LA MISMA MESA

function nuevaTanda() {

    if (!pedidoActual) {
        return;
    }

    const mesa = pedidoActual.mesa;

    if (!mesa) {
        return;
    }

    if (pedidoActual.estado === "Creado") {
        return;
    }

    if (!mesa.tandas) {
        mesa.tandas = [];
    }

    mesa.tandas.push(pedidoActual);

    const nuevoPedido =
        gestorPedidos.crearPedido(
            mesa.numero
        );

    if (!nuevoPedido) {

        alert(
            "No se pudo crear la nueva tanda para esta mesa."
        );

        return;

    }

    pedidoActual = nuevoPedido;

    mostrarPedido();

    actualizarCabeceraMesa();

}


// RESUMEN COMPLETO DE LA MESA (MODAL)

function abrirResumenMesa() {

    if (!pedidoActual) {
        return;
    }

    const mesa = pedidoActual.mesa;

    if (!mesa) {
        return;
    }

    const tandas =
        (mesa.tandas || []).concat([pedidoActual]);

    document.getElementById(
        "tituloResumenMesa"
    ).textContent =
        `Resumen de la mesa ${mesa.numero}`;

    const contenido =
        document.getElementById("contenidoResumenMesa");

    contenido.innerHTML = "";

    let totalFinal = 0;

    tandas.forEach(pedido => {

        const seccion =
            document.createElement("div");

        seccion.className = "tanda-seccion";

        const agrupados = {};

        pedido.productos.forEach(producto => {

            if (
                !agrupados[producto.nombre]
            ) {

                agrupados[
                    producto.nombre
                ] = {

                    producto: producto,
                    cantidad: 0

                };

            }

            agrupados[
                producto.nombre
            ].cantidad++;

        });

        let productosHTML = "";

        for (
            const nombre in agrupados
        ) {

            const item =
                agrupados[nombre];

            productosHTML +=
                `<div class="detalle-producto-fila">` +
                `<span>${item.cantidad} x ${item.producto.nombre}</span>` +
                `<span>$${(item.producto.precio * item.cantidad).toFixed(2)}</span>` +
                `</div>`;

        }

        seccion.innerHTML =
            `<div class="tanda-titulo">` +
                `<strong>Pedido #${pedido.numeroPedido} — ${pedido.estado}</strong>` +
                `<span class="tanda-subtotal">$${pedido.total.toFixed(2)}</span>` +
            `</div>` +
            (productosHTML ||
                `<p class="pedido-vacio">Sin productos.</p>`);

        contenido.appendChild(seccion);

        totalFinal += pedido.total;

    });

    document.getElementById(
        "totalResumenMesa"
    ).textContent =
        `$${totalFinal.toFixed(2)}`;

    document.getElementById(
        "modalResumenMesa"
    ).classList.remove("oculto");

}

function cerrarResumenMesa() {

    document.getElementById(
        "modalResumenMesa"
    ).classList.add("oculto");

}


// COBRAR PEDIDO

function cobrarPedido() {

    if (!pedidoActual) {
        return;
    }

    if (
        pedidoActual.productos.length === 0
    ) {

        alert(
            "No puedes cobrar un pedido vacío."
        );

        return;

    }

    if (pedidoActual.estado === "Creado") {

        alert(
            "Primero debes enviar el pedido a cocina."
        );

        return;

    }

    const mesa = pedidoActual.mesa;

    const tandas =
        (mesa && mesa.tandas) ?
            mesa.tandas :
            [];

    const todosLosPedidos =
        tandas.concat([pedidoActual]);

    const pendientes =
        todosLosPedidos.filter(
            p => p.estado !== "Listo"
        );

    if (pendientes.length > 0) {

        alert(
            "Todavía hay pedidos de esta mesa en preparación. Espera a que queden \"Listo\" para cobrar."
        );

        return;

    }


    guardarDatosCliente();


    const totalFinal =
        todosLosPedidos.reduce(
            (suma, pedido) =>
                suma + pedido.total,
            0
        );

    // Registrar venta y cobrar cada tanda de la mesa.

    todosLosPedidos.forEach(pedido => {

        gestorVentas.registrarVenta(
            pedido
        );

        gestorPedidos.cobrarPedido(
            pedido.numeroPedido
        );

    });

    if (mesa && mesa.tandas) {
        mesa.tandas = [];
    }


    alert(
        `Mesa ${mesa.numero} cobrada correctamente.\n` +
        `Total: $${totalFinal.toFixed(2)}`
    );


    pedidoActual = null;
    mesaActual = null;


    document
        .getElementById("vistaPedido")
        .classList.add("oculto");

    document
        .getElementById("vistaMesas")
        .classList.remove("oculto");


    mostrarMesas();

    mostrarListaEspera();

    actualizarVentas();

}


// RELACIONADOS - GRAFO (sugerencias no bloqueantes)

function mostrarRelacionados(
    nombreProducto
) {

    if (!pedidoActual) {
        return;
    }

    // Ya se mostró la sugerencia de este producto en este
    // mismo pedido: no se repite (evita la molestia de que
    // reaparezca cada vez que se agrega otra unidad).
    if (
        pedidoActual.sugerenciasMostradas.includes(
            nombreProducto
        )
    ) {
        return;
    }

    const relacionados =
        gestorMenu.mostrarRelacionados(
            nombreProducto
        );

    if (!relacionados || relacionados.length === 0) {
        return;
    }

    pedidoActual.sugerenciasMostradas.push(
        nombreProducto
    );

    const popup =
        document.getElementById("popupSugerencias");

    const texto =
        document.getElementById("popupSugerenciasTexto");

    const lista =
        document.getElementById("popupSugerenciasLista");

    if (!popup || !texto || !lista) {
        return;
    }

    texto.textContent =
        `Buen acompañamiento para ${nombreProducto}:`;

    lista.innerHTML = "";

    relacionados.forEach(producto => {

        const boton =
            document.createElement("button");

        boton.innerHTML = `
            <span>${producto.nombre}</span>
            <strong>$${producto.precio.toFixed(2)}</strong>
        `;

        boton.addEventListener("click", () => {

            agregarProducto(producto.id);

            popup.classList.add("oculto");

        });

        lista.appendChild(boton);

    });

    popup.classList.remove("oculto");

}

function integrarPedidoOnlineACocina(pedidoOnline) {
    const productos = [];

    console.log(
        "PRODUCTOS ONLINE:",
        pedidoOnline.productos
    );

    console.log(
        "MENU:",
        gestorMenu.menu
    );


    pedidoOnline.productos.forEach(item => {

        const producto =
            gestorMenu.menu.find(
                producto => producto.id === item.id
            );

        if (!producto) {
            return;
        }

        for (let i = 0; i < item.cantidad; i++) {
            productos.push(producto);
        }

    });

    if (productos.length === 0) {
        return;
    }

    const pedido =
        new Pedido(
            pedidoOnline.numeroPedido,
            null,
            productos
        );

    pedido.numeroPedido =
        pedidoOnline.id;

    pedido.nombreCliente =
        pedidoOnline.cliente || "";

    pedido.numeroPersonas = 1;

    pedido.total =
        pedidoOnline.total;

    pedido.tipo =
        pedidoOnline.tipo;

    pedido.direccion =
        pedidoOnline.direccion || null;

    pedido.referencia =
        pedidoOnline.referencia || null;

    pedido.codigoRetiro =
        pedidoOnline.codigoRetiro || null;

    pedido.tiempoTotalPreparacion =
        pedido.calcularTiempoTotal();

    pedidoOnline.tiempoTotalPreparacion =
        pedido.tiempoTotalPreparacion;

    pedidoOnline.inicioPreparacion =
        Date.now();

    gestorCocina.recibirPedido(
        pedido
    );

    mostrarListaEspera();

}


function procesarPedidosOnline() {

    const pedidosOnline =
        JSON.parse(
            localStorage.getItem("pedidosCliente") || "[]"
        );

    if (pedidosOnline.length === 0) {
        return;
    }

    let huboCambios = false;

    pedidosOnline.forEach(pedidoOnline => {

        if (pedidoOnline.estado !== "pendiente") {
            return;
        }

        const productos = [];

        pedidoOnline.productos.forEach(item => {

            const producto =
                gestorMenu.menu.find(
                    producto => producto.id === Number(item.id)
                );

            if (!producto) {
                console.warn(
                    "Producto no encontrado:",
                    item
                );

                return;
            }

            for (
                let i = 0;
                i < Number(item.cantidad);
                i++
            ) {

                productos.push(producto);

            }

        });

        if (productos.length === 0) {
            console.warn(
                "El pedido no tiene productos válidos:",
                pedidoOnline
            );

            return;
        }

        const pedido =
            new Pedido(
                pedidoOnline.numeroPedido,
                null
            );

        productos.forEach(producto => {

            pedido.agregarProducto(
                producto
            );

        });

        pedido.numeroPedido =
            pedidoOnline.numeroPedido;

        pedido.nombreCliente =
            pedidoOnline.cliente || "";

        pedido.numeroPersonas = 1;

        pedido.total =
            pedidoOnline.total;

        pedido.tipo =
            pedidoOnline.tipo;

        pedido.direccion =
            pedidoOnline.direccion || null;

        pedido.referencia =
            pedidoOnline.referencia || null;

        pedido.codigoRetiro =
            pedidoOnline.codigoRetiro || null;

        pedido.tiempoTotalPreparacion =
            pedido.calcularTiempoTotal();

        pedidoOnline.estado =
            "en_cocina";

        pedidoOnline.tiempoTotalPreparacion =
            pedido.tiempoTotalPreparacion;

        pedidoOnline.inicioPreparacion =
            Date.now();

        gestorCocina.recibirPedido(
            pedido
        );

        huboCambios = true;

    });

    if (huboCambios) {

        localStorage.setItem(
            "pedidosCliente",
            JSON.stringify(
                pedidosOnline
            )
        );

    }

}


// LISTA DE ESPERA (pedidos activos en cocina)

function mostrarListaEspera() {

    const contenedor =
        document.getElementById("listaEspera");

    if (!contenedor) {
        return;
    }

    const activos =
        gestorCocina.obtenerPedidosActivos();

    contenedor.innerHTML = "";

    if (activos.length === 0) {

        contenedor.innerHTML = `
            <p class="pedido-vacio">
                No hay pedidos en cocina por el momento.
            </p>
        `;

        return;

    }

    activos.forEach(pedido => {

        const tarjeta =
            document.createElement("div");

        const claseEstado =
            pedido.estado === "Preparando"
                ? "preparando"
                : pedido.estado === "Listo"
                    ? "listo"
                    : "";

        tarjeta.className =
            `tarjeta-espera ${claseEstado}`;

        tarjeta.innerHTML = `
            <div class="tarjeta-espera-fila">

                <strong>
                    Pedido #${pedido.numeroPedido}
                </strong>

                <span>
                    ${
                        pedido.mesa
                            ? `Mesa ${pedido.mesa.numero}`
                            : pedido.tipo === "delivery"
                                ? `<i class="fa-solid fa-motorcycle"></i> Delivery`
                                : `<i class="fa-solid fa-store"></i> Retiro en local`
                    }
                </span>

            </div>

            <div class="tarjeta-espera-fila">

                <span>
                    ${pedido.estado}
                </span>

                <span>
                    <i class="fa-solid fa-clock"></i>
                    ${pedido.tiempoTotalPreparacion} min
                </span>

            </div>
        `;

        tarjeta.addEventListener("click", () => {
            mostrarDetallePedido(pedido.numeroPedido);
        });

        contenedor.appendChild(tarjeta);

    });

}


// DETALLE DE TIEMPOS DE UN PEDIDO

function mostrarDetallePedido(numeroPedido) {

    const pedido =
        gestorPedidos.buscarPedido(numeroPedido) ||
        gestorCocina.obtenerPedidosActivos().find(
            p => p.numeroPedido === numeroPedido
        );

    if (!pedido) {
        return;
    }

    pedidoDetalleActual = pedido;

    let identificadorPedido;

    if (pedido.mesa) {

        identificadorPedido =
            `Mesa ${pedido.mesa.numero}`;

    } else if (pedido.tipo === "delivery") {

        identificadorPedido =
            `Delivery - ${pedido.nombreCliente || "Cliente"}`;

    } else if (pedido.tipo === "retiro") {

        identificadorPedido =
            `Retiro - ${pedido.nombreCliente || "Cliente"}`;

    } else {

        identificadorPedido =
            "Pedido online";

    }

    document.getElementById(
        "tituloDetallePedido"
    ).textContent =
        `Pedido #${pedido.numeroPedido} - ${identificadorPedido}`;

    document.getElementById(
        "detallePedidoEstado"
    ).innerHTML =
        `<span class="estado-pedido en-cocina">${pedido.estado}</span>`;

    const contenedorProductos =
        document.getElementById("detalleProductosTiempo");

    contenedorProductos.innerHTML = "";

    // Productos ordenados por tiempo: primero los más rápidos
    // (bebidas, etc.) y los postres al final, de menor a mayor.
    pedido.productosOrdenadosPorTiempo().forEach(item => {

        const fila =
            document.createElement("div");

        fila.className = "detalle-producto-fila";

        fila.innerHTML = `
            <span>${item.cantidad} x ${item.producto.nombre}</span>
            <span><i class="fa-solid fa-clock"></i> ${item.producto.tiempoPreparacion} min c/u</span>
        `;

        contenedorProductos.appendChild(fila);

    });

    document.getElementById(
        "detalleTiempoTotal"
    ).textContent =
        `${pedido.tiempoTotalPreparacion} min`;

    const modal =
        document.getElementById("modalDetallePedido");

    modal.classList.remove("oculto");

}

function cerrarDetallePedido() {

    document
        .getElementById("modalDetallePedido")
        .classList.add("oculto");

    pedidoDetalleActual = null;

}



// ORDENAMIENTO

function ordenarPorNombre() {

    gestorMenu.ordenarPorNombre();

    mostrarMenu();

}


function ordenarPorPrecio() {

    gestorMenu.ordenarPorPrecio();

    mostrarMenu();

}



// FILTRO POR CATEGORÍA

function seleccionarCategoria(
    categoria
) {

    categoriaActual = categoria;


    document
        .querySelectorAll(
            ".categoria-btn"
        )
        .forEach(boton => {

            boton.classList.remove(
                "activa"
            );

            if (
                boton.dataset.categoria ===
                categoria
            ) {

                boton.classList.add(
                    "activa"
                );

            }

        });


    mostrarMenu();

}


// ADMINISTRACIÓN
// Si quien inició sesión ya es administrador (desde el login
// de la página del cliente), se entra directo. Si no, se pide
// la contraseña de administrador antes de abrir el panel.

function abrirAdmin() {

    if (rolActivo === "admin") {
        abrirPanelAdmin();
        return;
    }

    document.getElementById("inputClaveAdmin").value = "";

    document
        .getElementById("modalClaveAdmin")
        .classList.remove("oculto");

    document.getElementById("inputClaveAdmin").focus();

}

function confirmarClaveAdmin() {

    const clave =
        document.getElementById("inputClaveAdmin").value.trim();

    if (clave !== CLAVE_ADMIN) {

        alert("Clave incorrecta.");

        document.getElementById("inputClaveAdmin").value = "";

        document.getElementById("inputClaveAdmin").focus();

        return;

    }

    document
        .getElementById("modalClaveAdmin")
        .classList.add("oculto");

    abrirPanelAdmin();

}

function cancelarClaveAdmin() {

    document
        .getElementById("modalClaveAdmin")
        .classList.add("oculto");

}

function abrirPanelAdmin() {

    document
        .getElementById("modalAdmin")
        .classList.remove("oculto");

    actualizarVentas();

    mostrarProductosAdmin();

}


function cerrarAdmin() {

    document
        .getElementById("modalAdmin")
        .classList.add("oculto");

}


// VENTAS
function actualizarVentas() {

    const totalPedidos =
        document.getElementById(
            "totalPedidos"
        );

    const totalVentas =
        document.getElementById(
            "totalVentas"
        );


    if (
        !totalPedidos ||
        !totalVentas
    ) {
        return;
    }


    totalPedidos.textContent =
        gestorVentas.contarVentas();


    totalVentas.textContent =
        `$${gestorVentas
            .totalVentas()
            .toFixed(2)}`;


    const tbody =
        document.querySelector(
            ".tabla-ventas tbody"
        );


    if (tbody) {

        tbody.innerHTML = "";


        gestorVentas.ventas.forEach(
            venta => {

                const fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML = `

                    <td>
                        #${venta.numeroPedido}
                    </td>

                    <td>
                        Mesa ${venta.mesa}
                    </td>

                    <td>
                        $${venta.total.toFixed(2)}
                    </td>

                    <td>
                        ${venta.fecha}
                    </td>

                `;


                tbody.appendChild(
                    fila
                );

            }
        );

    }


    const contenedor =
        document.getElementById(
            "resumenProductos"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    const resumen =
        gestorVentas.resumenPorProducto();


    for (
        const nombre in resumen
    ) {

        const span =
            document.createElement(
                "span"
            );

        span.textContent =
            `${nombre}: ${resumen[nombre]}`;

        contenedor.appendChild(
            span
        );

    }

}



// LIMPIAR VENTAS

function limpiarVentas() {

    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar todas las ventas registradas?"
        );


    if (!confirmar) {
        return;
    }


    gestorVentas.limpiar();

    actualizarVentas();

}



// CRUD DE PRODUCTOS
function mostrarProductosAdmin() {

    const contenedor =
        document.getElementById(
            "listaProductosAdmin"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    gestorMenu.menu.forEach(
        producto => {

            const fila =
                document.createElement(
                    "div"
                );

            fila.className =
                "admin-producto-fila";


            fila.innerHTML = `

                <div>

                    <strong>
                        ${producto.nombre}
                    </strong>

                    <span>
                        ${producto.categoria}
                        -
                        $${producto.precio.toFixed(2)}
                        -
                        ${producto.tiempoPreparacion} min
                    </span>

                </div>

                <div class="admin-producto-acciones">

                    <button
                        onclick="editarProducto(${producto.id})"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        onclick="eliminarProductoAdmin(${producto.id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            `;


            contenedor.appendChild(
                fila
            );

        }
    );

}



// GUARDAR PRODUCTO

function guardarProducto(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "productoId"
        ).value;


    const nombre =
        document.getElementById(
            "productoNombre"
        ).value.trim();


    const categoria =
        document.getElementById(
            "productoCategoria"
        ).value;


    const precio =
        parseFloat(
            document.getElementById(
                "productoPrecio"
            ).value
        );


    const tiempoIngresado =
        document.getElementById(
            "productoTiempo"
        ).value;

    const tiempoPreparacion =
        tiempoIngresado !== ""
            ? parseInt(tiempoIngresado, 10)
            : Producto.tiempoPorDefecto(categoria);


    if (
        nombre === "" ||
        isNaN(precio)
    ) {

        alert(
            "Completa correctamente los datos del producto."
        );

        return;

    }

    // EDITAR

    if (id !== "") {

        const producto =
            gestorMenu.obtenerProducto(
                parseInt(id)
            );


        if (producto) {

            producto.nombre =
                nombre;

            producto.categoria =
                categoria;

            producto.precio =
                precio;

            producto.tiempoPreparacion =
                tiempoPreparacion;

        }

    }



    // AGREGAR

    else {

        const nuevoId =
            gestorMenu.menu.length > 0
                ? Math.max(
                    ...gestorMenu.menu.map(
                        producto =>
                            producto.id
                    )
                ) + 1
                : 1;


        const nuevoProducto =
            new Producto(
                nuevoId,
                nombre,
                categoria,
                precio,
                tiempoPreparacion
            );


        gestorMenu.menu.push(
            nuevoProducto
        );

    }



    // RECREAR ESTRUCTURAS

    gestorMenu.grafo =
        new Grafo();

    gestorMenu.arbol =
        gestorMenu.crearArbolMenu();

    gestorMenu.crearGrafoProductos();


    limpiarFormularioProducto();

    mostrarMenu();

    mostrarProductosAdmin();

}


// EDITAR PRODUCTO

function editarProducto(id) {

    const producto =
        gestorMenu.obtenerProducto(id);


    if (!producto) {
        return;
    }


    document.getElementById(
        "productoId"
    ).value =
        producto.id;


    document.getElementById(
        "productoNombre"
    ).value =
        producto.nombre;


    document.getElementById(
        "productoCategoria"
    ).value =
        producto.categoria;


    document.getElementById(
        "productoPrecio"
    ).value =
        producto.precio;


    document.getElementById(
        "productoTiempo"
    ).value =
        producto.tiempoPreparacion;


    document.getElementById(
        "tituloFormProducto"
    ).textContent =
        "Editar producto";


    document.getElementById(
        "btnGuardarProducto"
    ).innerHTML =
        `<i class="fa-solid fa-save"></i> Guardar cambios`;


    document
        .getElementById(
            "btnCancelarEdicion"
        )
        .classList.remove(
            "oculto"
        );

}



// ELIMINAR PRODUCTO

function eliminarProductoAdmin(id) {

    const producto =
        gestorMenu.obtenerProducto(id);


    if (!producto) {
        return;
    }


    const confirmar =
        confirm(
            `¿Eliminar "${producto.nombre}" del menú?`
        );


    if (!confirmar) {
        return;
    }


    gestorMenu.menu =
        gestorMenu.menu.filter(
            producto =>
                producto.id !== id
        );


    gestorMenu.grafo =
        new Grafo();

    gestorMenu.arbol =
        gestorMenu.crearArbolMenu();

    gestorMenu.crearGrafoProductos();


    mostrarMenu();

    mostrarProductosAdmin();

}



// LIMPIAR FORMULARIO

function limpiarFormularioProducto() {

    document.getElementById(
        "productoId"
    ).value = "";

    document.getElementById(
        "productoNombre"
    ).value = "";

    document.getElementById(
        "productoPrecio"
    ).value = "";


    document.getElementById(
        "tituloFormProducto"
    ).textContent =
        "Agregar producto";


    document.getElementById(
        "btnGuardarProducto"
    ).innerHTML =
        `<i class="fa-solid fa-plus"></i> Agregar`;


    document
        .getElementById(
            "btnCancelarEdicion"
        )
        .classList.add(
            "oculto"
        );

}


// PESTAÑAS DE ADMINISTRACIÓN

function cambiarPestana(nombre) {

    const ventas =
        document.getElementById(
            "pestana-ventas"
        );

    const menu =
        document.getElementById(
            "pestana-menu"
        );


    if (nombre === "ventas") {

        ventas.classList.remove(
            "oculto"
        );

        menu.classList.add(
            "oculto"
        );

    }

    else {

        ventas.classList.add(
            "oculto"
        );

        menu.classList.remove(
            "oculto"
        );

        mostrarProductosAdmin();

    }


    document
        .querySelectorAll(
            ".pestana"
        )
        .forEach(pestana => {

            pestana.classList.remove(
                "activa"
            );

            if (
                pestana.dataset.pestana ===
                nombre
            ) {

                pestana.classList.add(
                    "activa"
                );

            }

        });

}


// PEDIDOS ONLINE

function cargarPedidosOnline() {

    try {

        const guardados =
            JSON.parse(
                localStorage.getItem(
                    "pedidosCliente"
                ) || "[]"
            );


        pedidosOnline =
            Array.isArray(guardados)
                ? guardados
                : [];

    }

    catch (error) {

        pedidosOnline = [];

    }

}


// MOSTRAR PEDIDOS ONLINE
function mostrarPedidosOnline() {

    cargarPedidosOnline();


    const contenedor =
        document.getElementById(
            "pedidosOnline"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    if (
        pedidosOnline.length === 0
    ) {

        contenedor.innerHTML = `
            <p class="pedido-vacio">
                No hay pedidos en línea pendientes.
            </p>
        `;

        return;

    }


    pedidosOnline.forEach(
        pedido => {

            const tarjeta =
                document.createElement(
                    "div"
                );


            tarjeta.className =
                "pedido-online-card";


            const productosHTML =
                pedido.productos
                    .map(
                        producto => `

                        <div class="pedido-online-producto">

                            <span>
                                ${producto.cantidad}
                                x
                                ${producto.nombre}
                            </span>

                            <strong>
                                $${(
                                    producto.precio *
                                    producto.cantidad
                                ).toFixed(2)}
                            </strong>

                        </div>

                    `
                    )
                    .join("");


            let informacionServicio = "";


            if (
                pedido.tipo === "delivery"
            ) {

                informacionServicio = `

                    <div class="pedido-online-dato">

                        <i class="fa-solid fa-motorcycle"></i>

                        <span>
                            Delivery
                        </span>

                    </div>


                    <div class="pedido-online-dato">

                        <i class="fa-solid fa-location-dot"></i>

                        <span>
                            ${pedido.direccion ||
                            "Sin dirección"}
                        </span>

                    </div>


                    <div class="pedido-online-dato">

                        <i class="fa-solid fa-map-pin"></i>

                        <span>
                            ${pedido.referencia ||
                            "Sin referencia"}
                        </span>

                    </div>

                `;

            }

            else {

                informacionServicio = `

                    <div class="pedido-online-dato">

                        <i class="fa-solid fa-store"></i>

                        <span>
                            Retiro en local
                        </span>

                    </div>


                    <div class="pedido-online-dato">

                        <i class="fa-solid fa-ticket"></i>

                        <span>
                            Código:
                            ${pedido.codigoRetiro ||
                            "Pendiente"}
                        </span>

                    </div>

                `;

            }


            tarjeta.innerHTML = `

                <div class="pedido-online-header">

                    <div>

                        <h3>
                            Pedido #${pedido.id}
                        </h3>

                        <span>
                            ${pedido.fecha || ""}
                        </span>

                    </div>

                    <strong class="pedido-online-total">
                        $${Number(
                            pedido.total
                        ).toFixed(2)}
                    </strong>

                </div>


                <div class="pedido-online-cliente">

                    <i class="fa-solid fa-user"></i>

                    <strong>
                        ${pedido.cliente ||
                        "Cliente"}
                    </strong>

                </div>


                <div class="pedido-online-servicio">

                    ${informacionServicio}

                </div>


                <div class="pedido-online-productos">

                    <h4>
                        Productos
                    </h4>

                    ${productosHTML}

                </div>


                <div class="pedido-online-acciones">

                    <button
                        class="btn-secundario btn-finalizar-online"
                        data-id="${pedido.id}"
                    >

                        <i class="fa-solid fa-check"></i>

                        Finalizar

                    </button>

                </div>

            `;


            // FINALIZAR

            tarjeta
                .querySelector(
                    ".btn-finalizar-online"
                )
                .addEventListener(
                    "click",
                    () => {

                        finalizarPedidoOnline(
                            pedido.id
                        );

                    }
                );


            contenedor.appendChild(
                tarjeta
            );

        }
    );

}


// FINALIZAR PEDIDO ONLINE

function finalizarPedidoOnline(
    idPedido
) {

    cargarPedidosOnline();


    const pedido =
        pedidosOnline.find(
            p => p.id === idPedido
        );


    if (!pedido) {
        return;
    }


    const confirmar =
        confirm(
            `¿Finalizar el pedido #${pedido.id} de ${pedido.cliente}?`
        );


    if (!confirmar) {
        return;
    }


    pedido.estado =
        "finalizado";


    localStorage.setItem(
        "pedidosCliente",
        JSON.stringify(
            pedidosOnline
        )
    );


    mostrarPedidosOnline();

}


// EVENTOS

function configurarEventos() {

    // ----------------------------------------
    // VOLVER A MESAS
    // ----------------------------------------

    document
        .getElementById(
            "btnVolverMesas"
        )
        .addEventListener(
            "click",
            volverMesas
        );


    // ----------------------------------------
    // BUSCAR
    // ----------------------------------------

    document
        .getElementById(
            "buscarMenu"
        )
        .addEventListener(
            "input",
            mostrarMenu
        );


    // ----------------------------------------
    // ORDENAR
    // ----------------------------------------

    document
        .getElementById(
            "btnOrdenarNombre"
        )
        .addEventListener(
            "click",
            ordenarPorNombre
        );


    document
        .getElementById(
            "btnOrdenarPrecio"
        )
        .addEventListener(
            "click",
            ordenarPorPrecio
        );


    // ----------------------------------------
    // CATEGORÍAS
    // ----------------------------------------

    document
        .querySelectorAll(
            ".categoria-btn"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        seleccionarCategoria(
                            boton.dataset.categoria
                        );

                    }
                );

            }
        );


    // ----------------------------------------
    // PEDIDO
    // ----------------------------------------

    document
        .getElementById(
            "btnDeshacer"
        )
        .addEventListener(
            "click",
            deshacer
        );


    document
        .getElementById(
            "btnEnviar"
        )
        .addEventListener(
            "click",
            enviarACocina
        );


    document
        .getElementById(
            "btnCobrar"
        )
        .addEventListener(
            "click",
            cobrarPedido
        );


    document
        .getElementById(
            "btnNuevaTanda"
        )
        .addEventListener(
            "click",
            nuevaTanda
        );


    document
        .getElementById(
            "btnCancelarPedido"
        )
        .addEventListener(
            "click",
            solicitarCancelacion
        );


    document
        .getElementById(
            "btnVerResumen"
        )
        .addEventListener(
            "click",
            abrirResumenMesa
        );


    document
        .getElementById(
            "btnCerrarResumenMesa"
        )
        .addEventListener(
            "click",
            cerrarResumenMesa
        );


    // DATOS DEL CLIENTE (por mesa)

    document
        .getElementById(
            "nombreCliente"
        )
        .addEventListener(
            "input",
            evento => {

                if (!pedidoActual) {
                    return;
                }

                pedidoActual.nombreCliente =
                    evento.target.value;

            }
        );


    document
        .getElementById(
            "numeroPersonas"
        )
        .addEventListener(
            "input",
            evento => {

                if (!pedidoActual) {
                    return;
                }

                pedidoActual.numeroPersonas =
                    evento.target.value;

            }
        );



    // ADMIN


    document
        .getElementById(
            "btnAdmin"
        )
        .addEventListener(
            "click",
            abrirAdmin
        );


    document
        .getElementById(
            "btnConfirmarClaveAdmin"
        )
        .addEventListener(
            "click",
            confirmarClaveAdmin
        );


    document
        .getElementById(
            "btnCancelarClaveAdmin"
        )
        .addEventListener(
            "click",
            cancelarClaveAdmin
        );


    document
        .getElementById(
            "inputClaveAdmin"
        )
        .addEventListener(
            "keydown",
            evento => {

                if (evento.key === "Enter") {
                    confirmarClaveAdmin();
                }

            }
        );


    document
        .getElementById(
            "btnCerrarAdmin"
        )
        .addEventListener(
            "click",
            cerrarAdmin
        );


    document
        .getElementById(
            "btnLimpiarVentas"
        )
        .addEventListener(
            "click",
            limpiarVentas
        );



    // VISTA CLIENTE

    document
        .getElementById(
            "btnVistaCliente"
        )
        .addEventListener(
            "click",
            () => {

                window.open(
                    "index.html",
                    "_blank"
                );

            }
        );



    // SUGERENCIAS (GRAFO) Y DETALLE DE TIEMPOS


    document
        .getElementById(
            "btnCerrarSugerencias"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "popupSugerencias"
                    )
                    .classList.add(
                        "oculto"
                    );

            }
        );


    document
        .getElementById(
            "btnCerrarDetallePedido"
        )
        .addEventListener(
            "click",
            cerrarDetallePedido
        );


    // FORMULARIO PRODUCTO


    document
        .getElementById(
            "formProducto"
        )
        .addEventListener(
            "submit",
            guardarProducto
        );


    document
        .getElementById(
            "btnCancelarEdicion"
        )
        .addEventListener(
            "click",
            limpiarFormularioProducto
        );



    // PESTAÑAS


    document
        .querySelectorAll(
            ".pestana"
        )
        .forEach(
            pestana => {

                pestana.addEventListener(
                    "click",
                    () => {

                        cambiarPestana(
                            pestana.dataset.pestana
                        );

                    }
                );

            }
        );

}



// SINCRONIZACIÓN DE PEDIDOS ONLINE


window.addEventListener(
    "storage",
    evento => {

        if (
            evento.key ===
            "pedidosCliente"
        ) {

            procesarPedidosOnline();

            mostrarListaEspera();

        }

    }
);