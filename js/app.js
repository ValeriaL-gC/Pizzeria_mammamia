
//mesas y pedidos 
const gestorMesas = new GestorMesas();
gestorMesas.crearMesas(10);
const gestorPedidos = new GestorPedidos(gestorMesas);
gestorPedidos.crearPedido(2);
gestorMesas.mostrarMesas();
gestorPedidos.mostrarPedidos(); 


//menu y productos
const gestorMenu = new GestorMenu();
gestorMenu.cargarProductos();
console.log("========== MENÚ ORIGINAL ==========");
gestorMenu.mostrarMenu();

// árbol de menú

const arbolMenu = gestorMenu.crearArbolMenu();
console.log("===== ÁRBOL DEL MENÚ =====");
arbolMenu.mostrar();


//búsqueda

console.log("========== BUSCAR PRODUCTO ==========");
let producto = gestorMenu.buscarProducto("Pepperoni");
console.log(producto);

console.log("========== ORDENAR POR NOMBRE ==========");
gestorMenu.ordenarPorNombre();
gestorMenu.mostrarMenu();

console.log("========== ORDENAR POR PRECIO ==========");
gestorMenu.ordenarPorPrecio();
gestorMenu.mostrarMenu();