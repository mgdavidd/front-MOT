import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "./CoursesList.module.css";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleInscripcion = () => {
    if (!selectedCourse) return;
    const userCookie = Cookies.get("user");
    if (!userCookie) return "";
    const userData = JSON.parse(userCookie);
    fetch(`http://localhost:3000/inscription/course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userData.id,
        courseId: selectedCourse.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Bienvenido a tu nuevo curso");
          setSelectedCourse(null); // cerrar modal
        }
      })
      .catch((error) => {
        console.error("Error al inscribir al curso:", error);
      });
  };

  const getUserPreferences = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return "";
      const userData = JSON.parse(userCookie);
      return userData.area || "";
    } catch (err) {
      console.error("Error leyendo cookie:", err);
      return "";
    }
  };

  const fetchCourses = async (preferences, search = "") => {
    try {
      setLoading(true);
      setError(null);

      let url = "";

      if (search.trim() !== "") {
        url = `http://localhost:3000/filterCourses/${encodeURIComponent(
          search
        )}`;
      } else {
        url = `http://localhost:3000/AllCourses/${encodeURIComponent(
          preferences
        )}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(
          `Error en la petición: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error al obtener cursos:", err);
      setError("No se pudieron cargar los cursos. Intenta nuevamente.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preferences = getUserPreferences();
    fetchCourses(preferences);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchCourses(getUserPreferences(), value);
  };

  const handleSelectCourse = async (course) => {
    try {
      const res = await fetch(
        `http://localhost:3000/courses/${course.id}/video/introduction`
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedCourse({ ...course, videoUrl: data.link });
      } else {
        setSelectedCourse({ ...course, videoUrl: null });
      }
    } catch (error) {
      console.error("Error obteniendo video:", error);
      setSelectedCourse({ ...course, videoUrl: null });
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Buscar cursos de su interés"
        value={searchTerm}
        onChange={handleSearchChange}
        className={styles.searchBar}
      />

      {loading && <p>Cargando cursos...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.cardsContainer}>
        {courses.map((course) => (
          <div
            key={course.id}
            className={styles.card}
            onClick={() => handleSelectCourse(course)}
          >
            <div className={styles.cardLeft}>
              <img
                src={course.imagen}
                alt={course.nombre}
                className={styles.cardImage}
              />
            </div>
            <div className={styles.cardRight}>
              <h3 className={styles.cardTitle}>{course.nombre}</h3>
              <p className={styles.cardDescription}>{course.descripcion}</p>
              <p className={styles.cardPrice}>
                Precio: ${course.precio.toLocaleString("es-ES")} CO
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedCourse(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedCourse.nombre}</h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setSelectedCourse(null)}
              >
                ×
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className={styles.modalContent}>
              {/* Contenedor para el video */}
              <div
                className={`${styles.videoContainer} ${
                  !selectedCourse.videoUrl ? styles.fullscreen : ""
                }`}
              >
                {selectedCourse.videoUrl ? (
                  <iframe
                    src={selectedCourse.videoUrl.replace("/view", "/preview")}
                    className={styles.videoFrame}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`Video de introducción - ${selectedCourse.nombre}`}
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <span className={styles.playIcon}>🎥</span>
                    <p>No hay video de introducción disponible</p>
                  </div>
                )}
              </div>

              {/* Información del curso */}
              <div className={styles.courseInfo}>
                <p className={styles.modalDescription}>
                  {selectedCourse.descripcion}
                </p>

                <div className={styles.courseDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Duración:</span>
                    <span className={styles.detailValue}>
                      {selectedCourse.duracion || "Por definir"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Nivel:</span>
                    <span className={styles.detailValue}>
                      {selectedCourse.nivel || "Todos los niveles"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Área:</span>
                    <span className={styles.detailValue}>
                      {selectedCourse.area || "General"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Precio:</span>
                    <span
                      className={`${styles.detailValue} ${styles.modalPrice}`}
                    >
                      ${selectedCourse.precio.toLocaleString("es-ES")} CO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setSelectedCourse(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.inscriptionBtn}
                onClick={handleInscripcion}
              >
                Inscribirme al curso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
