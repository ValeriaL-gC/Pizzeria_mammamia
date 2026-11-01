class Pila {

    constructor() {

        this.items = [];

    }

    push(dato) {

        this.items.push(dato);

    }

    pop() {

        if (this.estaVacia()) {

            return null;

        }

        return this.items.pop();

    }

    peek() {

        return this.items[this.items.length - 1];

    }

    estaVacia() {

        return this.items.length === 0;

    }

    mostrar() {

        console.log(this.items);

    }

}