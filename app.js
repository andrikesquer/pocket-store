// URL de la API publica
const API_URL = 'https://jsonplaceholder.typicode.com/users';

const lista = document.getElementById('lista');
const mensaje = document.getElementById('mensaje');
const estado = document.getElementById('estado');
const inputBuscar = document.getElementById('buscar');
const btnRecargar = document.getElementById('btnRecargar');

let usuarios = [];

// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.log('Error al registrar el SW:', err));
  });
}

// 2. Traer los datos de la API
async function cargarUsuarios() {
  mensaje.textContent = 'Cargando catálogo...';

  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error('Respuesta no valida: ' + respuesta.status);
    }

    usuarios = await respuesta.json();
    mostrarUsuarios(usuarios);

    if (navigator.onLine) {
      mensaje.textContent = `Se encontraron ${usuarios.length} registros.`;
    } else {
      mensaje.textContent = `Sin conexión. Mostrando ${usuarios.length} registros guardados.`;
    }
  } catch (error) {
    console.log(error);
    lista.innerHTML = '';
    mensaje.textContent = 'No se pudo cargar el catálogo. Conéctate a internet al menos una vez.';
    // navigator.onLine no siempre es confiable, si el fetch falla lo marcamos sin conexion
    estado.textContent = 'Sin conexión';
    estado.classList.add('offline');
  }
}

// 3. Pintar las tarjetas dentro del contenedor
function mostrarUsuarios(datos) {
  lista.innerHTML = '';

  if (datos.length === 0) {
    lista.innerHTML = '<p>No hay resultados.</p>';
    return;
  }

  datos.forEach(usuario => {
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('tarjeta');

    // iniciales para el "avatar"
    const iniciales = usuario.name.split(' ').map(p => p[0]).slice(0, 2).join('');

    tarjeta.innerHTML = `
      <div class="avatar">${iniciales}</div>
      <h3>${usuario.name}</h3>
      <p><strong>Usuario:</strong> ${usuario.username}</p>
      <p><strong>Email:</strong> ${usuario.email.toLowerCase()}</p>
      <p><strong>Ciudad:</strong> ${usuario.address.city}</p>
      <p><strong>Tel:</strong> ${usuario.phone}</p>
      <p class="empresa">${usuario.company.name}</p>
    `;

    lista.appendChild(tarjeta);
  });
}

// Filtro de busqueda
inputBuscar.addEventListener('input', () => {
  const texto = inputBuscar.value.toLowerCase();
  const filtrados = usuarios.filter(u =>
    u.name.toLowerCase().includes(texto) ||
    u.address.city.toLowerCase().includes(texto)
  );
  mostrarUsuarios(filtrados);
});

btnRecargar.addEventListener('click', cargarUsuarios);

// Indicador de conexion en la barra superior
function actualizarEstado() {
  if (navigator.onLine) {
    estado.textContent = 'En línea';
    estado.classList.remove('offline');
  } else {
    estado.textContent = 'Sin conexión';
    estado.classList.add('offline');
  }
}

window.addEventListener('online', actualizarEstado);
window.addEventListener('offline', actualizarEstado);

actualizarEstado();
cargarUsuarios();
