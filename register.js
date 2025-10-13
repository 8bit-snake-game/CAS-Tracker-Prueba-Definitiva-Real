const firebaseConfig = {
  apiKey: "AIzaSyCdtOXIjjB_kL34DhJSGuaT5OWzw2i_A2E",
  authDomain: "cas-tracker-dcfc4.firebaseapp.com",
  projectId: "cas-tracker-dcfc4",
  storageBucket: "cas-tracker-dcfc4.firebasestorage.app",
  messagingSenderId: "782100915031",
  appId: "1:782100915031:web:cd74ba7defa78927951412",
  measurementId: "G-67K0LVYY2H"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert("Cuenta creada ✅");
    window.location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
});
