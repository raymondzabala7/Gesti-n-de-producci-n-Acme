class SelectorProductos extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `<select id="dinamico-select" style="width:100%; padding:8px; border-radius:4px;"><option value="">Cargando ítems...</option></select>`;
    }

    async actualizarOpciones(inventarioCompleto) {
        const select = this.querySelector('#dinamico-select');
        select.innerHTML = '<option value="">-- Selecciona una opción --</option>';
        let contador = 0;
        let listaInv = Array.isArray(inventarioCompleto) ? inventarioCompleto.filter(i => i !== null) : Object.values(inventarioCompleto);

        listaInv.forEach(prod => {

            if (prod.formula) {
                const option = document.createElement('option');
                option.value = prod.codigo;
                option.textContent = `[${prod.codigo}] - ${prod.nombre || 'Producto'}`;
                select.appendChild(option);
                contador++;
            }
        });

        if (contador === 0) {
            select.innerHTML = '<option value="" disabled>No hay productos con recetas configuradas</option>';
        }
    }

    get value() { return this.querySelector('#dinamico-select').value; }
    set value(val) { this.querySelector('#dinamico-select').value = val; }
}
customElements.define('selector-productos', SelectorProductos);