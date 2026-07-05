const URL_BASE_DATOS = "https://raymond-68cd6-default-rtdb.firebaseio.com";
window.inventario = [];

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
    lista.forEach(i => {
        tbody.innerHTML += `
            <tr>
                <td><b>${i.codigo}</b></td>
                <td>${i.nombre}</td>
                <td><span class="badge">${i.stock || 0} U</span></td>
                <td>${i.formula ? 'Sí (Producto Terminado)' : 'No (Materia Prima)'}</td>
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

        if (formulaRaw) {
            try { formula = JSON.parse(formulaRaw); } 
            catch { return alert('Formato JSON erróneo en Fórmula. Ejemplo: {"M01":300}'); }
        }

        if (window.inventario.some(i => i.codigo === codigo)) {
            return alert("Este código de producto ya existe.");
        }

        window.inventario.push({ codigo, nombre, stock: 0, formula });

        try {
            await fetch(`${URL_BASE_DATOS}/inventario.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(window.inventario)
            });
            prodForm.reset();
            await window.cargarInventario();
            alert("Producto registrado con éxito.");
        } catch (err) {
            alert("Error al registrar el producto.");
        }
    });
}

const stockForm = document.getElementById('stockForm');
if (stockForm) {
    stockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = (document.getElementById('sCode') || document.getElementById('exeCode')).value.trim();
        const cant = parseInt((document.getElementById('sQty') || document.getElementById('exeQty')).value);

        const match = window.inventario.find(i => i.codigo === codigo);
        if (!match) return alert('El código especificado no existe en el maestro de inventario.');

        match.stock = (match.stock || 0) + cant;

        try {
            await fetch(`${URL_BASE_DATOS}/inventario.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(window.inventario)
            });
            stockForm.reset();
            await window.cargarInventario();
            alert(`Stock incrementado con éxito para ${codigo}.`);
        } catch (err) {
            alert("Error al actualizar stock.");
        }
    });
}

const searchInput = document.getElementById('search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtrados = window.inventario.filter(i => 
            i.nombre.toLowerCase().includes(term) || 
            i.codigo.toLowerCase().includes(term)
        );
        window.dibujarTabla(filtrados);
    });
}

window.cargarInventario();