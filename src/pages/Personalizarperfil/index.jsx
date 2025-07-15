import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import Logo from "../../components/Logo";

const coloresPastel = [
  "#FF6B81",
  "#FF9F45",
  "#FFE600",
  "#32E0C4",
  "#42A5F5",
  "#A259FF",
];

export default function EditarPerfil() {
  const navigate = useNavigate();

  const manejarCerrarSesion = () => {
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.logoWrapper}><Logo /></span>
          Editar Perfil
        </h1>

        <button className={styles.logoutBtn} onClick={manejarCerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <div className={styles.card}>
        <div className={styles.group}>
          <label className={styles.label}>Nombre de usuario</label>
          <input type="text" placeholder="Tu nombre" className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Foto de perfil</label>
          <input type="file" accept="image/*" className={styles.fileInput} />
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
          <label className={styles.label}>Paleta de colores</label>
          <div className={styles.colorGrid}>
            {coloresPastel.map((color, i) => (
              <div
                key={i}
                className={styles.colorCircle}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
