// index.jsx - EditarPerfil
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./style.module.css";
import Logo from "../../components/Logo";

const coloresPastel = [
  "#42A5F5", "#FF6B81", "#FF9F45",
  "#40df94ff", "#32E0C4", "#A259FF"
];

export default function EditarPerfil() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    nombre_usuario: "",
    email: "",
    rol: "",
    color_perfil: "#42A5F5",
    id: null,
    area: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      const cookieValue = Cookies.get("user");
      if (!cookieValue) {
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(cookieValue);
        const normalizedUser = user.rows ? {
          id: user.rows[0][0],
          nombre: user.rows[0][1],
          nombre_usuario: user.rows[0][2],
          email: user.rows[0][3],
          area: user.rows[0][5], // ✅ CAMBIO AQUÍ
          rol: user.rows[0][6],
          color_perfil: user.rows[0][10]
        } : user;

        setFormData({
          nombre: normalizedUser.nombre || "",
          nombre_usuario: normalizedUser.nombre_usuario || normalizedUser.nombre || "",
          email: normalizedUser.email || "",
          rol: normalizedUser.rol || "",
          color_perfil: normalizedUser.color_perfil || "#42A5F5",
          id: normalizedUser.id || null,
          area: normalizedUser.area || "",
        });

        document.documentElement.style.setProperty(
          '--color-primary',
          normalizedUser.color_perfil || "#42A5F5"
        );
      } catch (error) {
        console.error(error)
        Cookies.remove("user");
        navigate("/login");
      }
    };

    loadUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color_perfil: color }));
    document.documentElement.style.setProperty('--color-primary', color);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) return alert("Usuario no identificado");
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/edit-profile/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_usuario: formData.nombre_usuario,
          color_perfil: formData.color_perfil,
          area: formData.area,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const userRes = await fetch(`http://localhost:3000/user/${formData.id}`);
      if (!userRes.ok) throw new Error("Error al obtener datos actualizados");

      const userData = await userRes.json();
      const normalizedUser = userData.rows ? {
        id: userData.rows[0][0],
        nombre: userData.rows[0][1],
        nombre_usuario: userData.rows[0][2],
        email: userData.rows[0][3],
        area: userData.rows[0][5], // ✅ CAMBIO AQUÍ TAMBIÉN
        rol: userData.rows[0][6],
        color_perfil: userData.rows[0][10]
      } : userData;

      Cookies.set("user", JSON.stringify(normalizedUser), {
        expires: 7,
      });
    } catch (err) {
      alert(err.message || "Error en la conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.logoWrapper}>
            <Logo />
          </span>
          Editar Perfil
        </h1>
        <strong><h2>{formData.nombre}</h2></strong>

        <div className={styles.headerButtons}>
          <button
            onClick={() => navigate("/profile")}
            className={styles.backBtn}
            disabled={isLoading}
          >
            Volver
          </button>
          <button
            onClick={() => {
              Cookies.remove("user");
              navigate("/");
            }}
            className={styles.logoutBtn}
            disabled={isLoading}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <form className={styles.cardSmall} onSubmit={handleSubmit}>
        <div className={styles.group}>
          <center>
            <p><strong>{formData.email}</strong></p>
            <p><strong>{formData.rol}</strong></p>
          </center>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Nombre de usuario</label>
          <input
            type="text"
            name="nombre_usuario"
            value={formData.nombre_usuario}
            onChange={handleChange}
            className={styles.input}
            required
            minLength="3"
            maxLength="20"
            disabled={isLoading}
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Área</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ej: Matemáticas, Ciencias, Tecnología"
            disabled={isLoading}
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Banco</label>
          <select className={styles.input}>
            <option value="">Selecciona un banco</option>
            <option value="Bancolombia">Bancolombia</option>
            <option value="Davivienda">Davivienda</option>
            <option value="Banco de Bogotá">Banco de Bogotá</option>
            <option value="Banco de Occidente">Banco de Occidente</option>
            <option value="BBVA">BBVA</option>
            <option value="Nequi">Nequi</option>
            <option value="Banco Agrario">Banco Agrario</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Número de cuenta</label>
          <input
            type="number"
            placeholder="Ej: 1234567890"
            className={styles.input}
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Color del perfil</label>
          <div className={styles.colorGrid}>
            {coloresPastel.map((color, i) => (
              <button
                key={i}
                type="button"
                className={styles.colorCircle}
                style={{
                  backgroundColor: color,
                  outline: formData.color_perfil === color ? "3px solid black" : "none",
                }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Seleccionar color ${color}`}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
