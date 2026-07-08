const URL_BASE_DATOS = "https://raymond-68cd6-default-rtdb.firebaseio.com";
window.produccion = [];
let inventarioLocal = [];
async function fetchInventario() {
    try {
        const res = await fetch(`${URL_BASE_DATOS}/inventario.json`);
        const data = await res.json();
        if (data) {
            inventarioLocal = Array.isArray(data) ? data.filter(i => i !== null) : Object.values(data);
            const recetaSelect = document.getElementById('receta-select');
            if (recetaSelect && typeof recetaSelect.actualizarOpciones === 'function') {
                recetaSelect.actualizarOpciones(inventarioLocal);
            }
        }
    } catch (err) {
        console.error("Error cargando inventario base:", err);
    }
}

function mostrarDetallesReceta() {
    const detallesRecetaDiv = document.getElementById('detalles-receta');
    if (!detallesRecetaDiv) return;

    detallesRecetaDiv.innerHTML = '';
    const codigoProducto = document.getElementById('receta-select').value;
    const cantidadAFabricar = parseFloat(document.getElementById('exeQty').value) || 0;

    if (!codigoProducto) return;

    const producto = inventarioLocal.find(p => p.codigo === codigoProducto);
    if (!producto || !producto.formula) {
        detallesRecetaDiv.innerHTML = '<p style="color: red;">Fórmula no configurada para este ítem.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.style.paddingLeft = "20px";

    Object.entries(producto.formula).forEach(([materiaCod, cantNecesaria]) => {
        const insumo = inventarioLocal.find(i => i.codigo === materiaCod);
        const stockActual = insumo ? (insumo.stock || 0) : 0;
        const cantidadTotalRequerida = cantNecesaria * cantidadAFabricar;
        const nombreInsumo = insumo ? insumo.nombre : materiaCod;

        const li = document.createElement('li');
        li.style.marginBottom = "5px";
        li.innerHTML = `
            <strong>${nombreInsumo}</strong> (Código: ${materiaCod})<br>
            Necesita: ${cantidadTotalRequerida} | 
            Stock: <span style="${stockActual >= cantidadTotalRequerida ? 'color: green;' : 'color: red; font-weight: bold;'}">${stockActual}</span>
        `;
        ul.appendChild(li);
    });

    detallesRecetaDiv.appendChild(ul);
}

window.cargarHistorial = async () => {
    try {
        const res = await fetch(`${URL_BASE_DATOS}/produccion.json`);
        const data = await res.json();
        
        if (data) {
            window.produccion = Array.isArray(data) ? data.filter(p => p !== null) : Object.values(data);
        } else {
            window.produccion = [];
        }

        const tbody = document.getElementById('historyBody');
        if (tbody) {
            tbody.innerHTML = '';
            window.produccion.reverse().forEach(o => {
                let detalleInsumos = o.insumosDetalle ? o.insumosDetalle : "N/A";
                tbody.innerHTML += `
                    <tr>
                        <td><b># ${o.consecutivo}</b></td>
                        <td>${o.producto}</td>
                        <td>${o.cantidad} U</td>
                        <td style="font-size:0.85em; color:#475569;">${detalleInsumos}</td>
                    </tr>`;
            });
        }

        return window.produccion.length;
    } catch (err) {
        console.error(err);
        return 0;
    }
};

document.getElementById('prodForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnProducir = document.getElementById('btn-producir');
    const codigo = document.getElementById('receta-select').value;
    const cantidad = parseInt(document.getElementById('exeQty').value);

    if (!codigo) return alert("Por favor, selecciona un producto válido.");

    try {
        btnProducir.disabled = true;
        btnProducir.innerText = "Procesando...";

        const invRes = await fetch(`${URL_BASE_DATOS}/inventario.json`);
        let invData = await invRes.json();
        if (!invData) return alert("El inventario maestro se encuentra vacío.");

        let listaInv = Array.isArray(invData) ? invData.filter(i => i !== null) : Object.values(invData);
        const productoTerminado = listaInv.find(p => p.codigo === codigo);

        if (!productoTerminado || !productoTerminado.formula) {
            return alert("Código erróneo o no corresponde a un producto con receta/fórmula vinculada.");
        }

        let errorInsumos = false;
        let logInsumos = "";
        let logInsumosHistorial = "";

        for (const [materiaCod, cantNecesaria] of Object.entries(productoTerminado.formula)) {
            const totalRequerido = cantNecesaria * cantidad;
            const insumo = listaInv.find(i => i.codigo === materiaCod);

            if (!insumo || (insumo.stock || 0) < totalRequerido) {
                errorInsumos = true;
                alert(`Error: Stock deficiente para la materia prima [ ${materiaCod} ]. Requerido: ${totalRequerido}, En almacén: ${insumo ? insumo.stock : 0}`);
                break;
            }
            logInsumos += `• Descontados ${totalRequerido} unidades de [ ${insumo.nombre || materiaCod} ]<br>`;
            logInsumosHistorial += `${insumo.nombre || materiaCod}: -${totalRequerido}<br>`;
        }

        if (errorInsumos) return;
        for (const [materiaCod, cantNecesaria] of Object.entries(productoTerminado.formula)) {
            const totalRequerido = cantNecesaria * cantidad;
            const insumo = listaInv.find(i => i.codigo === materiaCod);
            insumo.stock -= totalRequerido;
        }

        productoTerminado.stock = (productoTerminado.stock || 0) + cantidad;

        await fetch(`${URL_BASE_DATOS}/inventario.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(listaInv)
        });

        const totalOrdenes = await window.cargarHistorial();
        const consecutivoNuevo = totalOrdenes + 1;

        window.produccion.push({ 
            consecutivo: consecutivoNuevo, 
            producto: productoTerminado.nombre || codigo, 
            cantidad,
            insumosDetalle: logInsumosHistorial
        });

        await fetch(`${URL_BASE_DATOS}/produccion.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.produccion)
        });

        document.getElementById('resumen').innerHTML = `
            <strong>Orden Exitosa Proceso (#${consecutivoNuevo})</strong><br><br>
            <b>Producto Fabricado:</b> ${productoTerminado.nombre || codigo}<br>
            <b>Cantidad Fabricada:</b> ${cantidad} unidades.<br><br>
            <b>Resumen de Materia Prima Usada:</b><br>${logInsumos}
        `;

        document.getElementById('prodForm').reset();
        document.getElementById('detalles-receta').innerHTML = '';
        
        await fetchInventario();
        await window.cargarHistorial();
    } catch (err) {
        alert("Fallo interno en el motor de producción.");
    } finally {
        btnProducir.disabled = false;
        btnProducir.innerText = "Procesar y Descontar";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const recetaSelect = document.getElementById('receta-select');
    const cantidadInput = document.getElementById('exeQty');

    if (recetaSelect) {
        recetaSelect.addEventListener('change', mostrarDetallesReceta);
    }
    if (cantidadInput) {
        cantidadInput.addEventListener('input', mostrarDetallesReceta);
    }
});

fetchInventario();
window.cargarHistorial();
