import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // 👈 importa la librería
import styles from "./Login.module.css";
import "../../assets/styles/auth/auth-base.css";
import "../../assets/styles/auth/auth-components.css";
import "../../assets/styles/auth/auth-variables.css";
import Logo from "../../components/Logo";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userName = e.target.elements.userName.value;
    const password = e.target.elements.password.value;

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 }); // 👈 guarda en cookie por 7 días
      navigate("/profile");
    } else {
      alert(data.error || "Ocurrió un error durante el login.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div style={{ width: "50%", margin: "0 auto" }}>
          <Logo />
        </div>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="userName"
            placeholder="Nombre o correo"
            required
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            className={styles.input}
          />
          <button type="submit" className={styles.submitButton}>
            Ingresar
          </button>
        </form>

        <button onClick={handleGoogleLogin} className={styles.googleButton}>
          Ingresar con Google
        </button>

        <div className="extra-link">
          ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
