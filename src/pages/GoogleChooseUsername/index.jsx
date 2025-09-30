import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./ChooseUsername.module.css";
import Logo from "../../components/Logo";
import { applyUserThemeFromCookies } from "../../utils/initUserTheme.js";

const GoogleChooseUsername = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get("email");
  const google_token = query.get("google_token");

  const [error, setError] = useState("");
  const [area, setArea] = useState("");
  const [rol, setRol] = useState("");

  const handleAreaChange = (e) => setArea(e.target.value);
  const handleRolChange = (e) => setRol(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const userName = e.target.elements.userName.value;
    const password = e.target.elements.password.value;

    if (!area) {
      setError("Por favor selecciona un área de interés.");
      return;
    }

    if (!rol) {
      setError("Por favor selecciona si eres estudiante o profesor.");
      return;
    }

    try {
      const res = await fetch("https://server-mot.onrender.com/choose-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          password,
          email,
          google_token: JSON.parse(google_token), // 🔥 CORRECCIÓN: Parsear el token
          areaInteres: area,
          rol, // 🔥 CORRECCIÓN: Enviar el rol seleccionado
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Cookies.set("user", JSON.stringify(data.user), { expires: 7 });
        Cookies.set("token", data.token, { expires: 7 });
        
        applyUserThemeFromCookies();

        if (rol === "profesor") {
          navigate("/instructorNav");

        } else {
          navigate("/studentNav");
        }
      } else {
        setError(data.error || "Error al crear la cuenta.");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("No se pudo conectar al servidor.");
    }
  };

  if (!email || !google_token) {
    return <div>Error: Faltan datos necesarios para completar el registro.</div>;
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        <h1 className={styles.title}>Completa tu Registro</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <input
            type="text"
            name="userName"
            placeholder="Elige un nombre de usuario"
            required
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Crea una contraseña"
            required
            className={styles.input}
          />

          {/* Select de áreas */}
          <div className={styles.selectWrapper}>
            <label htmlFor="areaSelect" className={styles.label}>
              Área de interés:
            </label>
            <select
              id="areaSelect"
              value={area}
              onChange={handleAreaChange}
              required
              className={styles.input}
            >
              <option value="">-- Selecciona un área --</option>
              <option value="Tecnología y Programación">
                Tecnología y Programación
              </option>
              <option value="Negocios y Marketing">Negocios y Marketing</option>
              <option value="Diseño y Creatividad">Diseño y Creatividad</option>
              <option value="Idiomas">Idiomas</option>
              <option value="Ciencias y Matemáticas">
                Ciencias y Matemáticas
              </option>
              <option value="Educación y Pedagogía">
                Educación y Pedagogía
              </option>
            </select>
          </div>

          {/* Selección de rol */}
          <div className={styles.selectWrapper}>
            <label className={styles.label}>Selecciona tu rol:</label>
            <div className={styles.roleContainer}>
              <label
                className={`${styles.roleOption} ${
                  rol === "estudiante" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  value="estudiante"
                  checked={rol === "estudiante"}
                  onChange={handleRolChange}
                />
                🎓 Estudiante
              </label>

              <label
                className={`${styles.roleOption} ${
                  rol === "profesor" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  value="profesor"
                  checked={rol === "profesor"}
                  onChange={handleRolChange}
                />
                👨‍🏫 Profesor
              </label>
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Finalizar Registro
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoogleChooseUsername;