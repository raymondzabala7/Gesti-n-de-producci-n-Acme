const URL_BASE_DATOS = "https://raymond-68cd6-default-rtdb.firebaseio.com";
window.inventario = [];
window.indexEditando = -1;

window.cargarInventario = async () => {
    try {
        const res = await fetch(`${URL_BASE_DATOS}/inventario.json`);
        const data = await res.json();
        
        if (data) {
            window.inventario = Array.isArray(data) ? data.filter(i => i !== null) : Object.values(data);
        } else {
            window.inventario = [];
        }
        window.dibujarTabla(window.inventario);
    } catch (err) {
        console.error("Error al cargar inventario:", err);
    }
};

window.dibujarTabla = (lista) => {
    const tbody = document.getElementById('invTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    lista.forEach((i) => {
        const indexReal = window.inventario.findIndex(item => item.codigo === i.codigo);
        
        tbody.innerHTML += `
            <tr>
                <td><b>${i.codigo}</b></td>
                <td>${i.nombre}</td>
                <td><span class="badge">${i.stock || 0} U</span></td>
                <td>${i.formula ? 'Sí (Producto Terminado)' : 'No (Materia Prima)'}</td>
                <td>
                    <button class="btn" style="padding: 2px 8px;" onclick="window.editarProducto(${indexReal})">Editar</button>
                    <button class="btn btn-danger" style="padding: 2px 8px;" onclick="window.eliminarProducto(${indexReal})">X</button>
                </td>
            </tr>`;
    });
};

const prodForm = document.getElementById('prodForm');
if (prodForm) {
    prodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = (document.getElementById('pCode') || document.getElementById('exeCode')).value.trim();
        const nombre = (document.getElementById('pName') || {value: "Producto nuevo"}).value.trim();
        const formulaRaw = (document.getElementById('pForm') || {value: ""}).value.trim();
        let formula = null;

        if (codigo === "" || nombre === "") {
            return alert("Los campos Código y Nombre no pueden estar vacíos o contener solo espacios.");
        }

        if (formulaRaw) {
            try { formula = JSON.parse(formulaRaw); } 
            catch { return alert('Formato JSON erróneo en Fórmula. Ejemplo: {"M01":300}'); }
        }

        const stockActual = window.indexEditando > -1 ? (window.inventario[window.indexEditando].stock || 0) : 0;
        const nuevoProd = { codigo, nombre, stock: stockActual, formula };

        if (window.indexEditando > -1) {
            window.inventario[window.indexEditando] = nuevoProd;
        } else {
            if (window.inventario.some(i => i.codigo === codigo)) {
                return alert("Este código de producto ya existe.");
            }
            window.inventario.push(nuevoProd);
        }

        await window.guardarEnFirebase();
        window.resetearFormulario();
    });
}

const stockForm = document.getElementById('stockForm');
if (stockForm) {
    stockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = (document.getElementById('sCode') || document.getElementById('exeCode')).value.trim();
        const cantInput = (document.getElementById('sQty') || document.getElementById('exeQty')).value;
        const cant = parseInt(cantInput, 10);

        if (codigo === "" || isNaN(cant) || cant <= 0) {
            return alert("Por favor ingresa un código válido y una cantidad mayor a 0.");
        }

        const match = window.inventario.find(i => i.codigo === codigo);
        if (!match) return alert('El código especificado no existe en el maestro de inventario.');

        match.stock = (match.stock || 0) + cant;

        await window.guardarEnFirebase();
        stockForm.reset();
        alert(`Stock incrementado con éxito para ${codigo}.`);
    });
}

window.editarProducto = (index) => {
    const i = window.inventario[index];
    if (i) {
        window.indexEditando = index;
        const formTitle = document.getElementById('formTitle');
        if (formTitle) formTitle.textContent = "Modificar Producto/Materia Prima";
        
        const pCodeInput = document.getElementById('pCode') || document.getElementById('exeCode');
        const pNameInput = document.getElementById('pName');
        const pFormInput = document.getElementById('pForm');

        if (pCodeInput) pCodeInput.value = i.codigo;
        if (pNameInput) pNameInput.value = i.nombre;
        if (pFormInput) pFormInput.value = i.formula ? JSON.stringify(i.formula) : "";
    }
};

window.eliminarProducto = async (index) => {
    if (confirm("¿Deseas eliminar permanentemente este ítem del maestro de inventario?")) {
        window.inventario.splice(index, 1);
        await window.guardarEnFirebase();
        if (window.indexEditando === index) {
            window.resetearFormulario();
        }
    }
};

window.guardarEnFirebase = async () => {
    try {
        await fetch(`${URL_BASE_DATOS}/inventario.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.inventario)
        });
        await window.cargarInventario();
    } catch (err) {
        alert("Error al sincronizar con la base de datos.");
    }
};

window.resetearFormulario = () => {
    if (prodForm) prodForm.reset();
    window.indexEditando = -1;
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = "Crear Materia Prima o Producto Terminado";
};

const searchInput = document.getElementById('search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtrados = window.inventario.filter(i => 
            i.nombre.toLowerCase().includes(term) || 
            i.codigo.toLowerCase().includes(term)
        );
        window.dibujarTabla(filtrados);
    });
}

window.cargarInventario();
