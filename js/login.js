const URL_BASE_DATOS = "https://raymond-68cd6-default-rtdb.firebaseio.com";

let isLoginMode = true;

const formTitle = document.getElementById('formTitle');
const formDescription = document.getElementById('formDescription');
const registerFields = document.getElementById('registerFields');
const confirmPassField = document.getElementById('confirmPassField');
const submitBtn = document.getElementById('submitBtn');
const switchText = document.getElementById('switchText');
const switchLink = document.getElementById('switchLink');
const regNameInput = document.getElementById('regName');
const regPassConfirmInput = document.getElementById('authPassConfirm');

switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        formTitle.textContent = "ACME Macondo";
        formDescription.style.display = "none";
        registerFields.style.display = "none";
        confirmPassField.style.display = "none";
        submitBtn.textContent = "Ingresar";
        switchText.textContent = "¿No tienes una cuenta?";
        switchLink.textContent = "Regístrate aquí";
        regNameInput.removeAttribute('required');
        regPassConfirmInput.removeAttribute('required');
    } else {
        formTitle.textContent = "Formulario de Registro Nuevo";
        formDescription.style.display = "block";
        registerFields.style.display = "block";
        confirmPassField.style.display = "block";
        submitBtn.textContent = "Registrarse e Ingresar";
        switchText.textContent = "¿Ya tienes cuenta?";
        switchLink.textContent = "Volver al Login";
        regNameInput.setAttribute('required', '');
        regPassConfirmInput.setAttribute('required', '');
    }
    document.getElementById('authForm').reset();
});

document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const identificacion = document.getElementById('authId').value.trim();
    const password = document.getElementById('authPass').value;

    try {
        const res = await fetch(`${URL_BASE_DATOS}/users.json`);
        const data = await res.json();
        
        let listaUsuarios = [];
        if (data) {
            listaUsuarios = Array.isArray(data) ? data.filter(u => u !== null) : Object.values(data);
        }

        if (isLoginMode) {
            const usuarioValido = listaUsuarios.find(u => u.identificacion === identificacion && u.password === password);

            if (usuarioValido) {
                alert(`¡Bienvenido/a ${usuarioValido.nombre}!`);
                window.location.href = 'inventario.html';
            } else {
                alert('Usuario o contraseña incorrectos.');
            }

        } else {
            const nombre = regNameInput.value.trim();
            const cargo = document.getElementById('regRole').value;
            const confirmPass = regPassConfirmInput.value;

            if (password !== confirmPass) { 
                return alert("Las contraseñas no coinciden"); 
            }

            if (listaUsuarios.some(u => u.identificacion === identificacion)) {
                return alert("Esta identificación ya se encuentra registrada.");
            }

            const nuevoUsuario = { identificacion, nombre, cargo, password };
            listaUsuarios.push(nuevoUsuario);

            await fetch(`${URL_BASE_DATOS}/users.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(listaUsuarios)
            });

            alert("¡Registro exitoso! Ingresando al sistema...");
            window.location.href = 'inventario.html';
        }

    } catch (error) {
        console.error(error);
        alert('Error al conectar con la base de datos.');
    }
});