document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const identificacion = document.getElementById('regIdNum').value.trim();
    const nombre = document.getElementById('regName').value.trim();
    const cargo = document.getElementById('regRole').value;
    const password = document.getElementById('regPass').value;
    const confirm = document.getElementById('regPassConfirm').value;

    if (password !== confirm) { 
        return alert("Las contraseñas no coinciden"); 
    }

    try {
        const res = await fetch(`${window.URL_LOGIN}/users.json`);
        const data = await res.json();
        
        let listaUsuarios = [];
        if (data) {
            listaUsuarios = Array.isArray(data) ? data.filter(u => u !== null) : Object.values(data);
        }

        if (listaUsuarios.some(u => u.identificacion === identificacion)) {
            return alert("Esta identificación ya se encuentra registrada.");
        }

        const nuevoUsuario = { identificacion, nombre, cargo, password };
        listaUsuarios.push(nuevoUsuario);

        await fetch(`${window.URL_LOGIN}/users.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(listaUsuarios)
        });

        alert("¡Registro exitoso! Ingresando al sistema...");
        window.location.href = 'inventario.html';

    } catch (err) {
        console.error(err);
        alert("Error al intentar registrar el usuario en la base de datos.");
    }
});