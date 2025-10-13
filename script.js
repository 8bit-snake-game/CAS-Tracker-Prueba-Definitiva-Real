if (!window.firebaseApp) {
  const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
  };
  window.firebaseApp = firebase.initializeApp(firebaseConfig);
  window.auth = firebase.auth();
}

// Mantener <body> oculto hasta verificar login
const bodyIndex = document.getElementById("bodyIndex");
if (bodyIndex) bodyIndex.style.display = "none";

// Verificar usuario logueado
window.auth.onAuthStateChanged(user => {
  if (!user) {
    // Redirige al login si no hay sesión
    window.location.href = "login.html";
  } else {
    // Usuario logueado, mostrar página
    if (bodyIndex) bodyIndex.style.display = "block";
    mostrarActividades();
    mostrarReflexiones();
    cargarHorario();
  }
});

// Logout (si hay botón)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await window.auth.signOut();
    window.location.href = "login.html";
  });
}

const bodyPage = document.getElementById("bodyPage");

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    bodyPage.style.display = "block";
    // Inicializar funciones específicas de la página
  }
});

const bodyIndex = document.getElementById("bodyIndex");

// ✅ Verificar usuario logueado
auth.onAuthStateChanged(user => {
  if (!user) {
    // No hay usuario, redirigir al login
    window.location.href = "login.html";
  } else {
    // Usuario logueado, mostrar contenido
    bodyIndex.style.display = "block";

    // Inicializar funciones solo si el usuario está logueado
    mostrarActividades();
    mostrarReflexiones();
    cargarHorario();
  }
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await auth.signOut();
});

// ---------------- ACTIVIDADES ----------------
async function guardarActividad(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value;
  const horas = parseInt(document.getElementById("horas").value);
  const fecha = document.getElementById("fecha").value;
  const descripcion = document.getElementById("descripcion").value.trim();

  const user = auth.currentUser;
  if (!user) return;

  await db.collection("usuarios").doc(user.uid).collection("actividades")
    .add({ nombre, categoria, horas, fecha, descripcion });
  document.getElementById("formActividad").reset();
  mostrarActividades();
}

async function mostrarActividades() {
  const tabla = document.querySelector("#tablaActividades tbody");
  if (!tabla) return;
  tabla.innerHTML = "";

  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("usuarios").doc(user.uid).collection("actividades").get();
  snapshot.forEach(doc => {
    const act = doc.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${act.nombre}</td>
      <td>${act.categoria}</td>
      <td>${act.horas}</td>
      <td>${act.fecha}</td>
      <td>${act.descripcion}</td>
      <td><button onclick="eliminarActividad('${doc.id}')">🗑️</button></td>`;
    tabla.appendChild(tr);
  });
}

async function eliminarActividad(id) {
  const user = auth.currentUser;
  if (!user) return;
  await db.collection("usuarios").doc(user.uid).collection("actividades").doc(id).delete();
  mostrarActividades();
}

// ---------------- REFLEXIONES ----------------
async function guardarReflexion(e) {
  e.preventDefault();
  const titulo = document.getElementById("tituloReflexion").value.trim();
  const texto = document.getElementById("textoReflexion").value.trim();
  const fecha = new Date().toISOString();

  const user = auth.currentUser;
  if (!user) return;

  await db.collection("usuarios").doc(user.uid).collection("reflexiones")
    .add({ titulo, texto, fecha });
  document.getElementById("formReflexion").reset();
  mostrarReflexiones();
}

async function mostrarReflexiones() {
  const cont = document.getElementById("listaReflexiones");
  if (!cont) return;
  cont.innerHTML = "";

  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("usuarios").doc(user.uid).collection("reflexiones").orderBy("fecha","desc").get();
  snapshot.forEach(doc => {
    const ref = doc.data();
    const div = document.createElement("div");
    div.classList.add("reflexion");
    div.innerHTML = `<h3>${ref.titulo}</h3><p>${ref.texto}</p>`;
    cont.appendChild(div);
  });
}

// ---------------- HORARIO ----------------
async function guardarHorario() {
  const user = auth.currentUser;
  if (!user) return;

  const tabla = document.querySelector("#tablaHorario tbody");
  const datos = {};
  tabla.querySelectorAll("tr").forEach(row => {
    const dia = row.cells[0].innerText;
    const act = row.cells[1].innerText;
    datos[dia] = act;
  });

  await db.collection("usuarios").doc(user.uid).collection("horario").doc("semanal").set(datos);
  alert("Horario guardado ✅");
}

async function cargarHorario() {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = db.collection("usuarios").doc(user.uid).collection("horario").doc("semanal");
  const docSnap = await docRef.get();
  if (!docSnap.exists) return;

  const datos = docSnap.data();
  const tabla = document.querySelector("#tablaHorario tbody");
  tabla.querySelectorAll("tr").forEach(row => {
    const dia = row.cells[0].innerText;
    row.cells[1].innerText = datos[dia] || "";
  });
}

document.getElementById("guardarHorario")?.addEventListener("click", guardarHorario);
document.getElementById("limpiarHorario")?.addEventListener("click", () => {
  document.querySelectorAll("#tablaHorario tbody tr td:nth-child(2)").forEach(td => td.innerText = "");
});
