import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./Signup.module.css";
import "../../assets/styles/auth/auth-base.css";
import "../../assets/styles/auth/auth-components.css";
import "../../assets/styles/auth/auth-variables.css";
import Logo from "../../components/Logo";
import { applyUserThemeFromCookies } from "../../utils/initUserTheme.js";


const Signup = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const userName = e.target.elements.userName.value;
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const isAdmin = e.target.elements.isAdmin.checked;

    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          email,
          password,
          isAdmin,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const { user, token } = data;

        Cookies.set("user", JSON.stringify(user), { expires: 7 });
        Cookies.set("token", token, { expires: 7 });

        applyUserThemeFromCookies();

        if (isAdmin) {
          navigate("/checksKnowledge", {
            state: { userName },
          });
        } else {
          navigate("/studentNav");
        }
      } else {
        setErrorMessage(data.error || "Ocurrió un error durante el registro.");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setErrorMessage("No se pudo conectar con el servidor.");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div style={{ width: "50%", margin: "0 auto" }}>
          <Logo />
        </div>
        <h1 className={styles.title}>Registro</h1>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="userName"
            placeholder="Nombre completo"
            required
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
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

          <label className={styles.adminCheckbox}>
            <input type="checkbox" name="isAdmin" id="isAdmin" />
            Eres Docente (necesitarás conectar Google Drive)
          </label>

          <button type="submit" className={styles.submitButton}>
            Registrarse
          </button>
        </form>

        <div className="extra-link">
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </div>

        <button onClick={handleGoogleSignup} className={styles.googleButton}>
          Regístrate con tu cuenta de Google <br />
        </button>
      </div>
    </div>
  );
};

export default Signup;
