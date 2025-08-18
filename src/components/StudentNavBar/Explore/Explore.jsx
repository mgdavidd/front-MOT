import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "./CoursesList.module.css";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserPreferences = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return "";
      const userData = JSON.parse(decodeURIComponent(userCookie));
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
        // Ruta de filtrado
        url = `http://localhost:3000/filterCourses/${encodeURIComponent(search)}`;
      } else {
        // Ruta por preferencias
        url = `http://localhost:3000/AllCourses/${encodeURIComponent(preferences)}`;
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
        {courses.map((course) => ( console.log(course),
          <div
            key={course.id}
            className={styles.card}
            onClick={() => setSelectedCourse(course)}
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
              <p className={styles.cardPrice}>Precio: ${course.precio.toLocaleString('es-ES')} CO</p>
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
            <h2>{selectedCourse.nombre}</h2>
            <p>{selectedCourse.descripcion}</p>
            <p>
              <strong>Precio:</strong> ${selectedCourse.precio.toLocaleString('es-ES')}
            </p>
            <button className={styles.inscriptionBtn}>Inscribirme</button>
          </div>
        </div>
      )}
    </div>
  );
}
