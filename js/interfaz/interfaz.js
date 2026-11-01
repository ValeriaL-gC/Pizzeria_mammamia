// INTERFAZ DEL CLIENTE - Pizzeria Mamamia
// Se comunica con el mesero (index.html) mediante
//   - menuProductos  -> menú administrado por el mesero
//   - pedidosCliente -> pedidos enviados por el cliente
// =====================================================

const CANTIDAD_MESAS = 10;

// ---------- MENÚ COMPARTIDO ----------
let menuProductos = [];
let categoriaActiva = "todas";

function menuPorDefecto() {
    return [
        { id: 1, nombre: "Pepperoni", categoria: "Pizzas/Tradicionales", precio: 10.50, imagen: "img/pepperoni.jpg" },
        { id: 2, nombre: "Hawaiana", categoria: "Pizzas/Tradicionales", precio: 11.00, imagen: "img/hawaiana.jpg" },
        { id: 3, nombre: "Jamón", categoria: "Pizzas/Tradicionales", precio: 10.00, imagen: "img/jamon.jpg" },
        { id: 4, nombre: "Margarita", categoria: "Pizzas/Tradicionales", precio: 9.50, imagen: "img/margarita.jpg" },
        { id: 5, nombre: "BBQ", categoria: "Pizzas/Especiales", precio: 13.50, imagen: "img/bbq.jpg" },
        { id: 6, nombre: "Suprema", categoria: "Pizzas/Especiales", precio: 14.00, imagen: "img/suprema.jpg" },
        { id: 7, nombre: "Cuatro Quesos", categoria: "Pizzas/Especiales", precio: 13.00, imagen: "img/cuatro-quesos.jpg" },
        { id: 8, nombre: "Coca-Cola", categoria: "Bebidas", precio: 2.00, imagen: "img/coca-cola.jpg" },
        { id: 9, nombre: "Sprite", categoria: "Bebidas", precio: 2.00, imagen: "img/sprite.jpg" },
        { id: 10, nombre: "Agua", categoria: "Bebidas", precio: 1.50, imagen: "img/agua.jpg" },
        { id: 11, nombre: "Brownie", categoria: "Postres", precio: 3.50, imagen: "img/brownie.jpg" },
        { id: 12, nombre: "Cheesecake", categoria: "Postres", precio: 4.00, imagen: "img/cheesecake.jpg" }
    ];
}

function cargarMenu() {
    try {
        const guardado = localStorage.getItem("menuProductos");
        if (guardado !== null) {
            const lista = JSON.parse(guardado);
            if (Array.isArray(lista) && lista.length > 0) {
                menuProductos = lista;
                return;
            }
        }
    } catch (e) {
        // ignorar JSON corrupto
    }
    menuProductos = menuPorDefecto();
}

function categoriasCliente() {
    return {
        "Pizzas/Tradicionales": "tradicionales",
        "Pizzas/Especiales": "especiales",
        "Bebidas": "bebidas",
        "Postres": "postres"
    };
}

function descripcionProducto(producto) {
    const descripciones = {
        "Pepperoni": "Pepperoni crocante, queso mozzarella fundido y salsa pomodoro casera.",
        "Hawaiana": "Jamón, piña caramelizada, mozzarella y un toque tropical.",
        "Jamón": "Jamón de primera, mozzarella y salsa de tomate artesanal.",
        "Margarita": "Salsa pomodoro, mozzarella fresca y albahaca.",
        "BBQ": "Pollo a la parrilla, salsa BBQ ahumada y cebolla morada.",
        "Suprema": "La combinación clásica: pepperoni, champiñones, pimiento y aceitunas.",
        "Cuatro Quesos": "Mozzarella, parmesano, gorgonzola y queso de cabra.",
        "Coca-Cola": "Bebida refrescante helada, ideal para acompañar.",
        "Sprite": "Sabor frutal y refrescante para compartir.",
        "Agua": "Agua pura y fría.",
        "Brownie": "Brownie de chocolate con nuez, servido al momento.",
        "Cheesecake": "Tarta de queso cremosa con base crujiente."
    };
    return descripciones[producto.nombre] || "Preparado al momento con ingredientes frescos.";
}

function renderMenu() {
    const contenedor = document.getElementById("pizzasGrid");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (menuProductos.length === 0) {
        contenedor.innerHTML = "<p class='empty-msg'>No hay productos disponibles.</p>";
        lucide.createIcons();
        return;
    }

    const mapaCategorias = categoriasCliente();
    const iconos = {
        "Pizzas/Tradicionales": "pizza",
        "Pizzas/Especiales": "pizza",
        "Bebidas": "cup-soda",
        "Postres": "ice-cream"
    };

    menuProductos.forEach(producto => {
        const catCliente = mapaCategorias[producto.categoria] || "todas";

        if (categoriaActiva !== "todas" && categoriaActiva !== catCliente) {
            return;
        }

        const tarjeta = document.createElement("div");
        tarjeta.className = "pizza-card";
        tarjeta.setAttribute("data-category", catCliente);

        const rutaImagen = producto.imagen || "";

        tarjeta.innerHTML =
            "<div class='card-img-wrapper'>" +
            (rutaImagen
                ? "<img src='" + rutaImagen + "' alt='" + producto.nombre + "' loading='lazy'>"
                : "<div class='card-img-fallback'><i data-lucide='" + (iconos[producto.categoria] || "pizza") + "'></i></div>") +
            "</div>" +
            "<div class='card-body'>" +
            "<h3 class='pizza-title'>" + producto.nombre + "</h3>" +
            "<p class='pizza-desc'>" + descripcionProducto(producto) + "</p>" +
            "<div class='card-footer'>" +
            "<span class='pizza-price'>$" + producto.precio.toFixed(2) + "</span>" +
            "<button class='btn-add' data-id='" + producto.id + "' data-name='" + producto.nombre + "' data-price='" + producto.precio + "'>" +
            "<i data-lucide='plus'></i><span>Agregar</span>" +
            "</button>" +
            "</div>" +
            "</div>";

        tarjeta.querySelector(".btn-add").addEventListener("click", function () {
            agregarAlCarrito(
                parseInt(this.dataset.id, 10),
                this.dataset.name,
                parseFloat(this.dataset.price)
            );
        });

        contenedor.appendChild(tarjeta);
    });

    lucide.createIcons();
}

// Filtro por categoría
document.querySelectorAll(".cat-btn").forEach(boton => {
    boton.addEventListener("click", function () {
        document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        categoriaActiva = this.dataset.category;
        renderMenu();
    });
});

// ---------- CARRUSEL DEL HERO ----------
let indiceSlide = 0;
const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".carousel-dots .dot");

function irASlide(n) {
    indiceSlide = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === indiceSlide));
    dots.forEach((d, i) => d.classList.toggle("active", i === indiceSlide));
}

document.getElementById("prevBtn").addEventListener("click", function () {
    irASlide(indiceSlide - 1);
});

document.getElementById("nextBtn").addEventListener("click", function () {
    irASlide(indiceSlide + 1);
});

dots.forEach(dot => {
    dot.addEventListener("click", function () {
        irASlide(parseInt(this.dataset.slide, 10));
    });
});

setInterval(function () {
    irASlide(indiceSlide + 1);
}, 5000);

// ---------- CARRITO ----------
let carrito = [];
let tipoPedido = "delivery";

function agregarAlCarrito(id, nombre, precio) {
    const existente = carrito.find(item => item.id === id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ id: id, nombre: nombre, precio: precio, cantidad: 1 });
    }

    const btnCart = document.getElementById("btnCart");
    btnCart.classList.add("bounce");
    setTimeout(function () {
        btnCart.classList.remove("bounce");
    }, 500);

    renderCarrito();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    }

    renderCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(i => i.id !== id);
    renderCarrito();
}

function totalCarrito() {
    return carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

function renderCarrito() {
    const contenedor = document.getElementById("cartItems");
    const total = totalCarrito();


    const cantidadTotal = carrito.reduce(
        (suma, item) => suma + item.cantidad,
        0
    );

    document.getElementById("cartCount").textContent = cantidadTotal;
    document.getElementById("cartTotal").textContent = "$" + total.toFixed(2);

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p class='empty-msg'>Tu carrito está vacío</p>";
        return;
    }

    carrito.forEach(item => {
        const fila = document.createElement("div");
        fila.className = "cart-item-row";

        fila.innerHTML =
            "<div class='cart-item-info'>" +
            "<h4>" + item.nombre + " x" + item.cantidad + "</h4>" +
            "<span class='cart-item-price'>$" + (item.precio * item.cantidad).toFixed(2) + "</span>" +
            "</div>" +
            "<div class='qty-controls'>" +
            "<button class='btn-qty' data-restar='" + item.id + "'>-</button>" +
            "<span>" + item.cantidad + "</span>" +
            "<button class='btn-qty' data-sumar='" + item.id + "'>+</button>" +
            "<button class='btn-remove' data-eliminar='" + item.id + "' aria-label='Quitar'>×</button>" +
            "</div>";

        fila.querySelector("[data-restar]").addEventListener("click", function () {
            cambiarCantidad(parseInt(this.dataset.restar, 10), -1);
        });

        fila.querySelector("[data-sumar]").addEventListener("click", function () {
            cambiarCantidad(parseInt(this.dataset.sumar, 10), 1);
        });

        fila.querySelector("[data-eliminar]").addEventListener("click", function () {
            eliminarDelCarrito(parseInt(this.dataset.eliminar, 10));
        });

        contenedor.appendChild(fila);
    });
}

// ---------- TIPO DE PEDIDO ----------
const btnDelivery = document.getElementById("btnDelivery");
const btnRetiro = document.getElementById("btnRetiro");

const datosDeliveryGroup = document.getElementById("datosDeliveryGroup");
const inputDireccion = document.getElementById("inputDireccion");
const inputReferencia = document.getElementById("inputReferencia");

function seleccionarTipoPedido(tipo) {
    tipoPedido = tipo;

    if (tipo === "delivery") {
        btnDelivery.style.background = "#eab308";
        btnDelivery.style.color = "#0f172a";
        btnDelivery.style.borderColor = "#eab308";

        btnRetiro.style.background = "#1e293b";
        btnRetiro.style.color = "#94a3b8";
        btnRetiro.style.borderColor = "#334155";

        datosDeliveryGroup.style.display = "block";
    } else {
        btnRetiro.style.background = "#eab308";
        btnRetiro.style.color = "#0f172a";
        btnRetiro.style.borderColor = "#eab308";

        btnDelivery.style.background = "#1e293b";
        btnDelivery.style.color = "#94a3b8";
        btnDelivery.style.borderColor = "#334155";

        datosDeliveryGroup.style.display = "none";
    }
}

btnDelivery.addEventListener("click", function () {
    seleccionarTipoPedido("delivery");
});

btnRetiro.addEventListener("click", function () {
    seleccionarTipoPedido("retiro");
});

seleccionarTipoPedido("delivery");

// Apertura / cierre del carrito
document.getElementById("btnCart").addEventListener("click", abrirCarrito);
document.getElementById("closeCart").addEventListener("click", cerrarCarrito);
document.getElementById("cartOverlay").addEventListener("click", cerrarCarrito);

function abrirCarrito() {
    document.getElementById("cartSidebar").classList.add("active");
    document.getElementById("cartOverlay").classList.add("active");
}

function cerrarCarrito() {
    document.getElementById("cartSidebar").classList.remove("active");
    document.getElementById("cartOverlay").classList.remove("active");
}

// ---------- ENVIO DEL PEDIDO AL MESERO  ----------
const inputNombreCliente = document.getElementById("inputNombreCliente");


// ---------- ENVÍO DEL PEDIDO AL MESERO ----------
function guardarPedidoCliente(pedido) {
    const lista = JSON.parse(localStorage.getItem("pedidosCliente") || "[]");
    lista.push(pedido);
    localStorage.setItem("pedidosCliente", JSON.stringify(lista));
}

function generarCodigoRetiro() {

    const numero =
        Math.floor(
            100000 + Math.random() * 900000
        );

    return "MAM-" + numero;

}

function obtenerSiguienteNumeroPedido() {

    const ultimoNumero =
        Number(
            localStorage.getItem("ultimoNumeroPedido") || "0"
        );

    const siguienteNumero =
        ultimoNumero + 1;

    localStorage.setItem(
        "ultimoNumeroPedido",
        siguienteNumero
    );

    return siguienteNumero;
}

document.getElementById("btnCheckout").addEventListener("click", function () {

    // ---------- VALIDAR CARRITO ----------
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de confirmar.");
        return;
    }

    // ---------- VALIDAR CLIENTE ----------
    const cliente = inputNombreCliente.value.trim();

    if (cliente === "") {
        alert("Escribe tu nombre y apellido.");
        inputNombreCliente.focus();
        return;
    }


    // DELIVERY

    if (tipoPedido === "delivery") {

        const direccion = inputDireccion.value.trim();
        const referencia = inputReferencia.value.trim();

        if (direccion === "") {
            alert("Escribe la dirección donde deseas recibir tu pedido.");
            inputDireccion.focus();
            return;
        }

        const pedido = {

            id: Date.now(),

            numeroPedido: obtenerSiguienteNumeroPedido(),

            tipo: "delivery",

            mesa: null,

            cliente: cliente,

            direccion: direccion,

            referencia: referencia,

            codigoRetiro: null,

            productos: carrito.map(item => ({
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad
            })),

            total: totalCarrito(),

            estado: "pendiente",

            fecha: new Date().toLocaleString("es-EC")
        };

        guardarPedidoCliente(pedido);


        carrito = [];
        renderCarrito();
        cerrarCarrito();

        alert(
            "¡Pedido enviado correctamente!" +
            "\n\nCliente: " + cliente +
            "\nModalidad: Delivery" +
            "\nDirección: " + direccion +
            "\n\nTu pedido ha sido enviado a cocina."
        );

        return;
    }



    // RETIRO EN LOCAL

    if (tipoPedido === "retiro") {

        const codigoRetiro = generarCodigoRetiro();

        const pedido = {

            id: Date.now(),

            numeroPedido: obtenerSiguienteNumeroPedido(),

            tipo: "retiro",

            mesa: null,

            cliente: cliente,

            direccion: null,

            referencia: null,

            codigoRetiro: codigoRetiro,

            productos: carrito.map(item => ({
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad
            })),

            total: totalCarrito(),

            estado: "pendiente",

            fecha: new Date().toLocaleString("es-EC")
        };

        guardarPedidoCliente(pedido);


        carrito = [];
        renderCarrito();
        cerrarCarrito();

        alert(
            "¡Pedido enviado correctamente!" +
            "\n\nCliente: " + cliente +
            "\nModalidad: Retiro en local" +
            "\nCódigo de retiro: " + codigoRetiro +
            "\n\nPresenta este código al retirar tu pedido."
        );

        return;
    }

});


// ---------- ACCESO DE PERSONAL (MESERO / ADMIN) ----------
let rolSeleccionado = null;

const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authPinInput = document.getElementById("authPinInput");

const userLoginModal = document.getElementById("userLoginModal");
const userLoginTitle = document.getElementById("userLoginTitle");
const userLoginDescription = document.getElementById("userLoginDescription");
const userLoginInput = document.getElementById("userLoginInput");
const userPasswordInput = document.getElementById("userPasswordInput");

// Clave general de cada rol (paso 1).
const clavesAcceso = {
    mesero: "1234",
    admin: "5678"
};

// Usuarios individuales de cada rol (paso 2).
const usuariosPorRol = {
    mesero: [
        { usuario: "juan", clave: "mesero1" },
        { usuario: "maria", clave: "mesero2" }
    ],
    admin: [
        { usuario: "admin", clave: "admin123" }
    ]
};

document.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", function (evento) {
        evento.preventDefault();
        rolSeleccionado = this.dataset.rol;
        authPinInput.value = "";

        authTitle.textContent =
            rolSeleccionado === "admin"
                ? "Acceso de Administrador"
                : "Acceso de Mesero";

        authModal.style.display = "flex";
        authPinInput.focus();
    });
});

// PASO 1: contraseña general del rol.
document.getElementById("btnConfirmAuth").addEventListener("click", function () {
    const clave = authPinInput.value.trim();

    if (clave === clavesAcceso[rolSeleccionado]) {
        authModal.style.display = "none";
        abrirLoginUsuario();
    } else {
        alert("Clave incorrecta. Inténtalo de nuevo.");
        authPinInput.value = "";
        authPinInput.focus();
    }
});

document.getElementById("btnCancelAuth").addEventListener("click", function () {
    authModal.style.display = "none";
    rolSeleccionado = null;
});

// PASO 2: login individual del usuario.
function abrirLoginUsuario() {
    userLoginInput.value = "";
    userPasswordInput.value = "";

    userLoginTitle.textContent =
        rolSeleccionado === "admin"
            ? "Ingreso de administrador"
            : "Ingreso de mesero";

    userLoginDescription.textContent =
        "Ingresa tu usuario y contraseña para identificarte.";

    userLoginModal.style.display = "flex";
    userLoginInput.focus();
}

document.getElementById("btnConfirmUserLogin").addEventListener("click", function () {
    const usuario = userLoginInput.value.trim().toLowerCase();
    const clave = userPasswordInput.value.trim();

    const listaUsuarios = usuariosPorRol[rolSeleccionado] || [];

    const encontrado = listaUsuarios.find(
        u => u.usuario === usuario && u.clave === clave
    );

    if (!encontrado) {
        alert("Usuario o contraseña incorrectos.");
        userPasswordInput.value = "";
        userPasswordInput.focus();
        return;
    }

    sessionStorage.setItem("rolActivo", rolSeleccionado);
    sessionStorage.setItem("usuarioActivo", encontrado.usuario);

    userLoginModal.style.display = "none";
    window.location.href = "mesero.html";
});

document.getElementById("btnCancelUserLogin").addEventListener("click", function () {
    userLoginModal.style.display = "none";
    rolSeleccionado = null;
});

// Cerrar modales con la tecla Escape
document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;

    if (authModal.style.display === "flex") {
        authModal.style.display = "none";
    }

    if (userLoginModal.style.display === "flex") {
        userLoginModal.style.display = "none";
    }
});

// ---------- SINCRONIZACIÓN EN TIEMPO REAL ----------
// Si el mesero edita el menú (otra pestaña), el cliente se actualiza.
window.addEventListener("storage", function (evento) {
    if (evento.key === "menuProductos") {
        cargarMenu();
        renderMenu();
    }
});

// ---------- ARRANQUE ----------
function iniciar() {
    lucide.createIcons();
    cargarMenu();
    renderMenu();
}

iniciar();

