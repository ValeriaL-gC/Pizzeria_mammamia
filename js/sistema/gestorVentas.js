class GestorVentas {

    constructor() {

        this.ventas = [];

        this.cargar();

    }

    registrarVenta(pedido) {

        const agrupados = {};

        pedido.productos.forEach(producto => {

            agrupados[producto.nombre] =
                (agrupados[producto.nombre] || 0) + 1;

        });

        const productos = [];

        for (const nombre in agrupados) {

            productos.push({
                nombre: nombre,
                cantidad: agrupados[nombre]
            });

        }

        const venta = {
            numeroPedido: pedido.numeroPedido,
            mesa: pedido.mesa.numero,
            total: pedido.total,
            productos: productos,
            fecha: new Date().toLocaleString("es-MX")
        };

        this.ventas.push(venta);

        this.guardar();

        return venta;

    }

    contarVentas() {

        return this.ventas.length;

    }

    totalVentas() {

        return this.ventas.reduce(
            (suma, venta) => suma + venta.total,
            0
        );

    }

    resumenPorProducto() {

        const resumen = {};

        this.ventas.forEach(venta => {

            venta.productos.forEach(producto => {

                resumen[producto.nombre] =
                    (resumen[producto.nombre] || 0) + producto.cantidad;

            });

        });

        return resumen;

    }

    limpiar() {

        this.ventas = [];

        this.guardar();

    }

    guardar() {

        localStorage.setItem(
            "ventasDia",
            JSON.stringify(this.ventas)
        );

    }

    cargar() {

        const guardado = localStorage.getItem("ventasDia");

        if (guardado !== null) {

            this.ventas = JSON.parse(guardado);

        }

    }

}
