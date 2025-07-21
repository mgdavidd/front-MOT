import React, { useState, useEffect, useRef, useCallback } from "react";
import { DateTime } from "luxon";
import Cookies from "js-cookie";
import "./InstructorCal.css";
import DatePicker from "../DatePicker";

const InstructorCal = () => {
  // obtener usuario desde cookies
  const getCurrentUser = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return null;
      const decoded = decodeURIComponent(userCookie);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Error al parsear cookie:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [currentEventType, setCurrentEventType] = useState("Clase en vivo");
  const [dateEvents, setDateEvents] = useState({});
  const [hoursByDate, setHoursByDate] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorValidation, setErrorValidation] = useState(null);
  const timeSelectorsRef = useRef(null);

  const authFetch = useCallback(
    async (url, options = {}) => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }

      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${userId}`,
      };

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error en la solicitud");
      }
      return response.json();
    },
    [userId]
  );

  //modo editar
  useEffect(() => {
    if (!userId) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await authFetch(
          `http://localhost:3000/teachers/${userId}/courses`
        );
        setCourses(data);
        setSelectedCourseId(data[0]?.id || null);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar cursos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, authFetch]);

  // cargar fechas del curso seleccionado
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchDates = async () => {
      try {
        setLoading(true);
        const data = await authFetch(
          `http://localhost:3000/courses/${selectedCourseId}/dates`
        );
        const newDateEvents = {};
        const newHoursByDate = {};

        data.forEach((session) => {
          const startDate = DateTime.fromISO(session.inicio).toLocal();
          const endDate = DateTime.fromISO(session.final).toLocal();
          const dateKey = startDate.toISODate();

          newDateEvents[dateKey] = session.tipo;
          newHoursByDate[dateKey] = {
            start: startDate.toFormat("HH:mm"),
            end: endDate.toFormat("HH:mm"),
            recording: session.recording_url,
            title: session.titulo,
          };
        });

        setDateEvents(newDateEvents);
        setHoursByDate(newHoursByDate);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar sesiones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, [selectedCourseId, authFetch]);

  const formatDate = useCallback((dateString) => {
    return DateTime.fromISO(dateString).setLocale("es").toLocaleString({
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const selectedCourse = courses.find(
    (course) => String(course.id) === String(selectedCourseId)
  );
  const isOwner = selectedCourse && selectedCourse.isOwner;
  console.log(isOwner);

  const updateDisplay = useCallback(() => {
    if (!timeSelectorsRef.current) return;

    const container = timeSelectorsRef.current;
    container.innerHTML = "";

    Object.entries(dateEvents)
      .sort(
        ([dateA], [dateB]) => DateTime.fromISO(dateA) - DateTime.fromISO(dateB)
      )
      .forEach(([date, type]) => {
        const { start, end, recording, title } = hoursByDate[date] || {};
        const isPast = DateTime.fromISO(date).startOf("day") < DateTime.local().startOf("day");


        const sessionElement = document.createElement("div");
        sessionElement.className = `session-card ${type}-type`;
        sessionElement.innerHTML = `
          <div class="session-header">
            <span class="session-type">${type.toUpperCase()}</span>
            ${
              isEditing && isOwner
                ? `<button class="remove-session" data-date="${date}">×</button>`
                : ""
            }
          </div>
          <div class="session-date">${formatDate(date)}</div>
          <div class="session-time">
            ${start && end ? `${start} - ${end}` : "Horario no definido"}
          </div>
          ${
            recording
              ? `<div class="recording-info"><a href="${recording}" target="_blank" rel="noopener noreferrer">Ver grabación: ${
                  title || "Sesión grabada"
                }</a></div>`
              : ""
          }
          ${
            isEditing && isOwner
              ? `
            <div class="time-inputs">
              <input type="time" name="start-${date}" value="${start || ""}" ${
                  isPast ? "disabled" : ""
                }>
              <input type="time" name="end-${date}" value="${end || ""}" ${
                  isPast ? "disabled" : ""
                }>
            </div>
          `
              : ""
          }
        `;

        // Eliminar fecha
        if (isEditing && isOwner) {
          const removeBtn = sessionElement.querySelector(".remove-session");
          removeBtn?.addEventListener("click", () => {
            const newDateEvents = { ...dateEvents };
            const newHours = { ...hoursByDate };
            delete newDateEvents[date];
            delete newHours[date];
            setDateEvents(newDateEvents);
            setHoursByDate(newHours);
          });
        }

        container.appendChild(sessionElement);
      });
  }, [dateEvents, hoursByDate, isEditing, formatDate, isOwner]);

  useEffect(() => {
    updateDisplay();
  }, [updateDisplay]);

  const handleSave = async () => {
    setErrorValidation(null);
    try {
      setLoading(true);

      const sessionsData = [];

      for (const [date, type] of Object.entries(dateEvents)) {
        const start = document.querySelector(
          `input[name="start-${date}"]`
        )?.value;
        const end = document.querySelector(`input[name="end-${date}"]`)?.value;

        const startDate = DateTime.fromISO(`${date}T${start}`);
        const endDate = DateTime.fromISO(`${date}T${end}`);
        const dateLabel = startDate.setLocale("es").toLocaleString({
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        if (!start || !end) {
          setErrorValidation(
            `Faltan horarios para la sesión del ${dateLabel}.`
          );
          setLoading(false);
          return;
        }

        if (startDate >= endDate) {
          setErrorValidation(
            `La hora inicial de la sesión del ${dateLabel} debe ser menor que la hora final.`
          );
          setLoading(false);
          return;
        }

        const duration = endDate.diff(startDate, "hours").hours;
        if (duration > 1.5) {
          setErrorValidation(
            `La duración de la sesión del ${dateLabel} no puede ser mayor a 1.5 horas.`
          );
          setLoading(false);
          return;
        }

        sessionsData.push({
          date,
          type,
          start_time: startDate.toISO(),
          end_time: endDate.toISO(),
        });
      }

      await authFetch(
        `http://localhost:3000/courses/${selectedCourseId}/dates`,
        {
          method: "POST",
          body: JSON.stringify({ sessions: sessionsData }),
        }
      );

      // Recargar sesiones después de guardar
      const data = await authFetch(
        `http://localhost:3000/courses/${selectedCourseId}/dates`
      );

      const newDateEvents = {};
      const newHoursByDate = {};

      data.forEach((session) => {
        const startDate = DateTime.fromISO(session.inicio).toLocal();
        const endDate = DateTime.fromISO(session.final).toLocal();
        const dateKey = startDate.toISODate();

        newDateEvents[dateKey] = session.tipo;
        newHoursByDate[dateKey] = {
          start: startDate.toFormat("HH:mm"),
          end: endDate.toFormat("HH:mm"),
          recording: session.recording_url,
          title: session.titulo,
        };
      });

      setDateEvents(newDateEvents);
      setHoursByDate(newHoursByDate);

      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error al guardar sesiones:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="auth-error">
        <h3>No autenticado</h3>
        <p>Por favor inicia sesión para acceder al calendario</p>
      </div>
    );
  }

  if (loading && courses.length === 0) {
    return <div className="loading">Cargando tus cursos...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  // Simulación de calendario múltiple con <select multiple>
  const allDates = [];
  for (let i = 0; i < 60; i++) {
    const date = DateTime.local().plus({ days: i }).toISODate();
    allDates.push(date);
  }

  return (
    <div className="instructor-calendar">
      <header className="calendar-header">
        <h2>Calendario de Clases</h2>
        <div className="course-selector">
          <select
            value={selectedCourseId || ""}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={loading}
            className="styled-select"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.nombre}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="calendar-toolbar">
        {isOwner && (
          <button
            className={`edit-button ${isEditing ? "active" : ""}`}
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            {isEditing ? "Cancelar" : "Editar Horarios"}
          </button>
        )}
      </div>

      <div
        className={`modal-error-validation ${errorValidation ? "active" : ""}`}
      >
        <div className="modal-content">
          <h3>Error de Validación</h3>
          <p>{errorValidation}</p>
          <button onClick={() => setErrorValidation(null)}>Cerrar</button>
        </div>
      </div>

      <div className="calendar-main">
        {isEditing && isOwner && (
          <div className="calendar-editor">
            <div className="event-type-selector">
              <button
                className={`type-button clase-en-vivo ${
                  currentEventType === "Clase en vivo" ? "active" : ""
                }`}
                onClick={() => setCurrentEventType("Clase en vivo")}
              >
                Clase Virtual
              </button>
              <button
                className={`type-button aaa ${
                  currentEventType === "AAA" ? "active" : ""
                }`}
                onClick={() => setCurrentEventType("AAA")}
              >
                Encuentro AAA
              </button>
            </div>

            <div className="calendar-container">
              <DatePicker
                value={Object.keys(dateEvents)}
                onChange={(dates) => {
                  if (!isEditing || !isOwner) return;
                  const selected = dates.map((d) => d.format("YYYY-MM-DD"));
                  const newDateEvents = { ...dateEvents };
                  const newHours = { ...hoursByDate };
                  selected.forEach((date) => {
                    if (!newDateEvents[date]) {
                      newDateEvents[date] = currentEventType;
                      newHours[date] = {
                        start: "",
                        end: "",
                        recording: "",
                        title: "",
                      };
                    }
                  });
                  // Eliminar fechas deseleccionadas
                  Object.keys(newDateEvents).forEach((date) => {
                    if (!selected.includes(date)) {
                      delete newDateEvents[date];
                      delete newHours[date];
                    }
                  });
                  setDateEvents(newDateEvents);
                  setHoursByDate(newHours);
                }}
              />
            </div>
          </div>
        )}

        <div className="sessions-container">
          <h3>{isEditing ? "Sesiones Programadas" : "Próximas Sesiones"}</h3>
          <div className="sessions-list" ref={timeSelectorsRef}></div>
        </div>
      </div>

      {isEditing && isOwner && (
        <div className="save-section">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={loading || Object.keys(dateEvents).length === 0}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InstructorCal;
