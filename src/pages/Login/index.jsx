import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./Login.module.css";
import "../../assets/styles/auth/auth-base.css";
import "../../assets/styles/auth/auth-components.css";
import "../../assets/styles/auth/auth-variables.css";
import Logo from "../../components/Logo";
import { applyUserThemeFromCookies } from "../../utils/initUserTheme.js";
import Alert from "../../components/Alert.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const userName = e.target.elements.userName.value;
    const password = e.target.elements.password.value;

    try {
      const res = await fetch("https://server-mot.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const { user, token } = data;

        Cookies.set("user", JSON.stringify(user), { expires: 7 });
        Cookies.set("token", token, { expires: 7 });

        applyUserThemeFromCookies();

        const userRole = user.rol?.toLowerCase();
        if (userRole === "profesor") {
          navigate("/instructorNav");
        } else if (userRole === "estudiante") {
          navigate("/studentNav");
        } else {
          navigate("/");
        }
      } else {
        setAlert({
          isOpen: true,
          title: "Error",
          message: data.error || "Ocurrió un error durante el login.",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error en el login:", error);
      setAlert({
        isOpen: true,
        title: "Error",
        message: "Error de conexión. Intenta nuevamente.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://server-mot.onrender.com/auth/google";
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
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            className={styles.input}
            disabled={isLoading}
          />
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <button 
          onClick={handleGoogleLogin} 
          className={styles.googleButton}
          disabled={isLoading}
        >
          Ingresar con Google
        </button>

        <div className="extra-link">
          ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
        </div>
      </div>

      <Alert
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ isOpen: false, title: "", message: "", type: "info" })}
        autoCloseTime={4000}
      />
    </div>
  );
};

export default Login;