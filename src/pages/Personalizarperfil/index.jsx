import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./style.module.css";
import Logo from "../../components/Logo";
import Alert from "../../components/Alert";

const coloresPastel = [
  "#42A5F5",
  "#FF6B81",
  "#FF9F45",
  "#40df94ff",
  "#32E0C4",
  "#A259FF",
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
    fotoPerfil: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", type: "info" });

  useEffect(() => {
    const loadUserData = async () => {
      const cookieValue = Cookies.get("user");
      if (!cookieValue) {
        navigate("/");
        return;
      }

      try {
        const user = JSON.parse(cookieValue);

        setFormData((prev) => ({
          ...prev,
          nombre: user.nombre || "",
          nombre_usuario: user.nombre_usuario || user.nombre || "",
          email: user.email || "",
          rol: user.rol || "",
          color_perfil: user.color_perfil || "#42A5F5",
          id: user.id || null,
          area: user.area || "",
        }));

        document.documentElement.style.setProperty(
          "--color-primary",
          user.color_perfil || "#42A5F5"
        );

        const fotoRes = await fetch(
          `https://server-mot.onrender.com/users/${user.id}/foto`
        );
        if (fotoRes.ok) {
          const data = await fotoRes.json();
          if (data.fotoPerfil) {
            setFormData((prev) => ({ ...prev, fotoPerfil: data.fotoPerfil }));
          }
        }
      } catch (error) {
        console.error(error);
        Cookies.remove("user");
        navigate("/");
      }
    };

    loadUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({ ...prev, color_perfil: color }));
    document.documentElement.style.setProperty("--color-primary", color);
  };

  const handleImageChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      if (archivo.size > 5 * 1024 * 1024) {
        setAlert({
          isOpen: true,
          title: "Error",
          message: "La imagen es demasiado grande. Menor a 5MB.",
          type: "error"
        });
        return;
      }

      if (!archivo.type.startsWith("image/")) {
        setAlert({
          isOpen: true,
          title: "Error",
          message: "Por favor, selecciona un archivo de imagen válido.",
          type: "error"
        });
        return;
      }

      const lector = new FileReader();
      lector.onloadend = () => setSelectedImage(lector.result);
      lector.readAsDataURL(archivo);
    }
  };

  const removeImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(null);
    setFormData((prev) => ({ ...prev, fotoPerfil: "" }));
    const fileInput = document.getElementById("profilePhoto");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) {
      setAlert({
        isOpen: true,
        title: "Error",
        message: "Usuario no identificado",
        type: "error"
      });
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch(
        `https://server-mot.onrender.com/edit-profile/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre_usuario: formData.nombre_usuario,
            color_perfil: formData.color_perfil,
            area: formData.area,
            fotoPerfil: selectedImage || formData.fotoPerfil,
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const userRes = await fetch(`https://server-mot.onrender.com/users/${formData.id}`);
      if (!userRes.ok) throw new Error("Error al obtener datos actualizados");

      const userData = await userRes.json();

      const updatedUserForCookie = {
        id: userData.id,
        nombre: userData.nombre,
        nombre_usuario: userData.nombre_usuario,
        email: userData.email,
        area: userData.area,
        rol: userData.rol,
        color_perfil: userData.color_perfil,
      };

      Cookies.set("user", JSON.stringify(updatedUserForCookie), { expires: 7 });

      setAlert({
        isOpen: true,
        title: "Éxito",
        message: "Perfil actualizado correctamente",
        type: "success"
      });

      setTimeout(() => {
        navigate("/instructorNav");
      }, 1500);
    } catch (err) {
      console.error("Error completo:", err);
      setAlert({
        isOpen: true,
        title: "Error",
        message: err.message || "Error en la conexión",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (selectedImage) return selectedImage;
    if (formData.fotoPerfil) return formData.fotoPerfil;
    return null;
  };

  const getInitials = () => {
    if (!formData.nombre) return "??";
    return formData.nombre
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasProfileImage = () => {
    return selectedImage || formData.fotoPerfil;
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
        <strong>
          <h2>{formData.nombre}</h2>
        </strong>

        <div className={styles.headerButtons}>
          <button
            onClick={() => navigate("/instructorNav")}
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
          <label className={styles.label}>Foto de perfil</label>
          <div className={styles.profilePhotoSection}>
            <div className={styles.profilePhotoWrapper}>
              {hasProfileImage() && (
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={removeImage}
                  title="Eliminar foto"
                  aria-label="Eliminar foto de perfil"
                >
                  ✕
                </button>
              )}
              <div
                className={styles.profilePhotoContainer}
                onClick={() => document.getElementById("profilePhoto").click()}
              >
                {hasProfileImage() ? (
                  <img
                    src={getProfileImageUrl()}
                    alt="Foto de perfil"
                    className={styles.profilePhoto}
                  />
                ) : (
                  <div
                    className={styles.profilePhotoPlaceholder}
                    style={{ backgroundColor: formData.color_perfil }}
                  >
                    {getInitials()}
                  </div>
                )}
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
              id="profilePhoto"
              disabled={isLoading}
            />

            <label htmlFor="profilePhoto" className={styles.fileInputLabel}>
              {hasProfileImage() ? "Cambiar foto" : "Subir foto"}
            </label>
          </div>
        </div>

        <div className={styles.group}>
          <center>
            <p>
              <strong>{formData.email}</strong>
            </p>
            <p>
              <strong>{formData.rol}</strong>
            </p>
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
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            className={styles.input}
            disabled={isLoading}
            required
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
            <option value="Educación y Pedagogía">Educación y Pedagogía</option>
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Banco</label>
          <select className={styles.input} disabled={isLoading}>
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
            disabled={isLoading}
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
                  outline:
                    formData.color_perfil === color
                      ? "3px solid black"
                      : "none",
                }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Seleccionar color ${color}`}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>

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
}