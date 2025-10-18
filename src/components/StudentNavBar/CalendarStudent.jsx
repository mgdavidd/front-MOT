import React, { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import Cookies from "js-cookie";
import "../InstructorNavBar/InstructorCal";

const CalendarStudent = () => {
  const getCurrentUser = () => {
    try {
      const cookie = Cookies.get("user");
      if (!cookie) return null;
      return JSON.parse(cookie);
    } catch {
      return null;
    }
  };

  const user = getCurrentUser();
  const userId = user?.id;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [dateData, setDateData] = useState({});
  const [error, setError] = useState(null);

  const authFetch = useCallback(async (url) => {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error en la solicitud");
    }
    return res.json();
  }, []);

  const loadCourses = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await authFetch(
        `https://server-mot.onrender.com/courses/student/${userId}`
      );

      const filteredCourses = data.filter(
        (course) => course.tipoCurso !== "pregrabado"
      );
      setCourses(filteredCourses);
      setSelectedCourseId(filteredCourses[0]?.id || null);
    } catch (err) {
      setError(err.message);
    }
  }, [userId, authFetch]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const loadDates = useCallback(async () => {
    if (!selectedCourseId) return;
    try {
      const data = await authFetch(
        `https://server-mot.onrender.com/courses/${selectedCourseId}/dates`
      );

      const newDateData = {};
      data.forEach((s) => {
        // convertir desde UTC a local y también conservar hora UTC
        const inicioUTC = DateTime.fromISO(s.inicio, { zone: "utc" });
        const finalUTC = DateTime.fromISO(s.final, { zone: "utc" });
        const inicioLocal = inicioUTC.setZone("local");
        const finalLocal = finalUTC.setZone("local");
        const dateKey = inicioLocal.toISODate();

        newDateData[dateKey] = {
          start: inicioLocal.toFormat("HH:mm"),
          end: finalLocal.toFormat("HH:mm"),
          utcStart: inicioUTC.toFormat("HH:mm"),
          utcEnd: finalUTC.toFormat("HH:mm"),
          title: s.titulo,
          type: s.tipo,
          join_link: s.join_link,
          recording_url: s.recording_url,
        };
      });

      setDateData(newDateData);
    } catch (err) {
      setError(err.message);
    }
  }, [selectedCourseId, authFetch]);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  // Función para manejar el acceso seguro a las videollamadas
  const handleJoinClass = (joinLink, e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) return;

    // Proxy en el backend se encarga de validar y redirigir
    const url = `https://server-mot.onrender.com${joinLink}?auth=${token}`;
    window.open(url, "_blank");
  };

  return (
    <div className="instructor-calendar">
      {error && <p className="error">{error}</p>}

      <div className="timezone-info">
        Zona horaria actual: {DateTime.local().zoneName}
      </div>

      <select
        value={selectedCourseId || ""}
        onChange={(e) => setSelectedCourseId(Number(e.target.value))}
        disabled={!courses.length}
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <div>
        {Object.entries(dateData)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, data]) => {
            const dateObj = DateTime.fromISO(date);
            return (
              <div key={date} className="session-card" data-type={data.type}>
                <h4>
                  {dateObj.setLocale("es").toLocaleString(DateTime.DATE_FULL)}
                </h4>
                <p>Tipo: {data.type}</p>
                <p>Título: {data.title || "Clase"}</p>

                <p>
                  Horario: {data.start} - {data.end}
                </p>
                {data.utcStart && data.utcEnd && (
                  <p style={{ fontSize: "0.9em", color: "#666" }}>
                    Horario UTC: {data.utcStart} - {data.utcEnd}
                  </p>
                )}

                {data.join_link && (
                  <p>
                    Enlace:{" "}
                    <a
                      href="#"
                      onClick={(e) => handleJoinClass(data.join_link, e)}
                      style={{
                        color: "#007bff",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Unirse a la clase
                    </a>
                  </p>
                )}
                {data.recording_url && (
                  <a
                    href={data.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button>Ver Grabación</button>
                  </a>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CalendarStudent;
