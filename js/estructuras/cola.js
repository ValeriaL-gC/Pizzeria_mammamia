class Cola {

    constructor() {

        this.items = [];

    }

    enqueue(dato) {

        this.items.push(dato);

    }

    dequeue() {

        if (this.estaVacia()) {
            return null;
        }

        return this.items.shift();

    }

    front() {

        return this.items[0];

    }

    estaVacia() {

        return this.items.length === 0;

    }

    size() {

        return this.items.length;

    }

    mostrar() {

        return this.items;

    }

}