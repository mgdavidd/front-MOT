import React, { useState, useEffect, useCallback, useRef } from "react";
import { DateTime } from "luxon";
import Cookies from "js-cookie";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./InstructorCal.css";

const InstructorCal = () => {
  const getCurrentUser = () => {
    try {
      const cookie = Cookies.get("user");
      if (!cookie) return null;
      return JSON.parse(decodeURIComponent(cookie));
    } catch {
      return null;
    }
  };

  const user = getCurrentUser();
  const userId = user?.id;

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateData, setDateData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [eventType, setEventType] = useState("Clase en vivo");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });
  const sessionsContainerRef = useRef(null);

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("token")}`,
    };

    const res = await fetch(url, {
      ...options,
      headers,
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
        `http://localhost:3000/teachers/${userId}/courses`
      );
      setCourses(data);
      setSelectedCourseId(data[0]?.id || null);
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
        `http://localhost:3000/courses/${selectedCourseId}/dates`
      );
      const newDateData = {};
      const newSelectedDates = [];

      data.forEach((s) => {
        console.log("Sesión:", s);
        const inicioLocal = DateTime.fromISO(s.inicio);
        const finalLocal = DateTime.fromISO(s.final);
        const isoDate = inicioLocal.toISODate();

        newDateData[isoDate] = {
          start: inicioLocal.toFormat("HH:mm"),
          end: finalLocal.toFormat("HH:mm"),
          title: s.titulo,
          type: s.tipo,
          link: s.join_link,
          recording_url: s.recording_url
        };
        newSelectedDates.push(inicioLocal.toJSDate());
      });

      setSelectedDates(newSelectedDates);
      setDateData(newDateData);
    } catch (err) {
      setError(err.message);
    }
  }, [selectedCourseId, authFetch]);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const isOwner = !!selectedCourse?.isOwner;

  const handleDateSelect = (dates) => {
    if (!isEditing || !isOwner) return;

    const newDateData = { ...dateData };
    const newSelectedDates = dates || [];

    Object.keys(newDateData).forEach((dateStr) => {
      const exists = newSelectedDates.some((d) => {
        const ds = DateTime.fromJSDate(d).toISODate();
        return ds === dateStr;
      });
      if (!exists) delete newDateData[dateStr];
    });

    newSelectedDates.forEach((date) => {
      const iso = DateTime.fromJSDate(date).toISODate();
      if (!newDateData[iso]) {
        newDateData[iso] = { start: "", end: "", title: "", type: eventType };
      }
    });

    setSelectedDates(newSelectedDates);
    setDateData(newDateData);
  };

  const handleSave = async () => {
    try {
      const invalidEntries = Object.entries(dateData).filter(([date, data]) => {
        console.log(date, data);
        return !data.start || !data.end;
      });

      if (invalidEntries.length > 0) {
        throw new Error("Faltan horas de inicio/fin para algunas fechas");
      }

      const sessions = Object.entries(dateData).map(([date, data]) => ({
        date,
        start_time: data.start,
        end_time: data.end,
        titulo: data.title || "Clase",
        type: data.type,
      }));

      const response = await authFetch(
        `http://localhost:3000/courses/${selectedCourseId}/dates`,
        {
          method: "POST",
          body: JSON.stringify({ sessions }),
        }
      );

      console.log("Respuesta al guardar:", response);
      setIsEditing(false);
      loadDates();
      setModal({
        isOpen: true,
        title: "Éxito",
        message: "Calendario actualizado correctamente",
      });
    } catch (err) {
      console.error("Error al guardar:", err);
      setModal({
        isOpen: true,
        title: "Error",
        message: err.message || "Error al guardar los cambios",
      });
    }
  };

  return (
    <div className="instructor-calendar">
      <h2>Calendario de Clases</h2>
      {error && <p className="error">{error}</p>}

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

      {isOwner && (
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancelar" : "Editar"}
        </button>
      )}

      {isEditing && (
        <>
          <div>
            <label>Tipo:</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="Clase en vivo">Clase en vivo</option>
              <option value="AAA">AAA</option>
            </select>
          </div>

          <DayPicker
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateSelect}
          />
        </>
      )}

      <div ref={sessionsContainerRef}>
        {Object.entries(dateData)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, data]) => {
            const isPast =
              DateTime.fromISO(date).startOf("day") < DateTime.local().startOf("day");

            return (
              <div key={date} className="session-card" data-type={data.type}>
                <h4>
                  {DateTime.fromISO(date)
                    .setLocale("es")
                    .toLocaleString(DateTime.DATE_FULL)}
                </h4>
                <p  data-type-badge={data.type}>Tipo: {data.type}</p>
                {isEditing ? (
                  <>
                    <input
                      type="time"
                      value={data.start}
                      onChange={(e) =>
                        setDateData((prev) => ({
                          ...prev,
                          [date]: { ...prev[date], start: e.target.value },
                        }))
                      }
                      disabled={isPast || data.recording_url}
                    />
                    <input
                      type="time"
                      value={data.end}
                      onChange={(e) =>
                        setDateData((prev) => ({
                          ...prev,
                          [date]: { ...prev[date], end: e.target.value },
                        }))
                      }
                      disabled={isPast  || data.recording_url}
                    />
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) =>
                        setDateData((prev) => ({
                          ...prev,
                          [date]: { ...prev[date], title: e.target.value },
                        }))
                      }
                      placeholder="Título"
                      disabled={isPast || data.recording_url}
                    />
                  </>
                ) : (
                  <>
                    <p>Hora: {data.start} - {data.end}</p>
                    <p>Título: {data.title || "Clase"}</p>
                    {data.link && (
                      <p>
                        Enlace:{" "}<a href={`http://localhost:3001${data.link}`} target="_blank" rel="noopener noreferrer">Unirse a la clase</a>
                      </p>
                      
                    )}
                    {data.recording_url && <a href={data.recording_url} target="_blank" rel="noopener noreferrer"><button>Ver Grabación</button></a>}
                  </>
                )}
              </div>
            );
          })}
      </div>

      {isEditing && (
        <button onClick={handleSave} className="save-btn">
          Guardar Cambios
        </button>
      )}

      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <button onClick={() => setModal({ isOpen: false, title: "", message: "" })}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCal;