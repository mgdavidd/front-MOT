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
      return JSON.parse(cookie);
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
  console.log(Cookies.get("token"));

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("token")}`,
    };
    console.log("Headers:", headers);
    const res = await fetch(url, { ...options, headers: headers });
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
        `https://server-mot.onrender.com/teachers/${userId}/courses`
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
      const newSelectedDates = [];

      data.forEach((s) => {
        const inicioUTC = DateTime.fromISO(s.inicio, { zone: "utc" });
        const finalUTC = DateTime.fromISO(s.final, { zone: "utc" });

        const inicioLocal = inicioUTC.setZone("local");
        const finalLocal = finalUTC.setZone("local");

        const localDateKey = inicioLocal.toISODate();

        newDateData[localDateKey] = {
          start: inicioLocal.toFormat("HH:mm"),
          end: finalLocal.toFormat("HH:mm"),
          utcStart: inicioUTC.toFormat("HH:mm"),
          utcEnd: finalUTC.toFormat("HH:mm"),
          title: s.titulo,
          type: s.tipo,
          join_link: s.join_link, // Ahora es el enlace del proxy
          recording_url: s.recording_url,
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
    const newData = { ...dateData };
    const newDates = dates || [];

    Object.keys(newData).forEach((d) => {
      if (!newDates.some((x) => DateTime.fromJSDate(x).toISODate() === d)) {
        delete newData[d];
      }
    });
    newDates.forEach((x) => {
      const iso = DateTime.fromJSDate(x).toISODate();
      if (!newData[iso]) {
        newData[iso] = {
          start: "",
          end: "",
          utcStart: "",
          utcEnd: "",
          title: "",
          type: eventType,
        };
      }
    });

    setSelectedDates(newDates);
    setDateData(newData);
  };

  const handleTimeChange = (date, field, value) => {
    setDateData((prev) => {
      const newData = { ...prev };
      const isoDate = DateTime.fromJSDate(date).toISODate();

      if (!newData[isoDate]) {
        newData[isoDate] = {
          start: "",
          end: "",
          utcStart: "",
          utcEnd: "",
          title: "",
          type: eventType,
        };
      }

      newData[isoDate][field] = value;

      if (newData[isoDate].start && newData[isoDate].end) {
        const dateStr = isoDate;

        const startLocal = DateTime.fromISO(
          `${dateStr}T${newData[isoDate].start}`,
          { zone: "local" }
        );
        const endLocal = DateTime.fromISO(
          `${dateStr}T${newData[isoDate].end}`,
          { zone: "local" }
        );

        newData[isoDate].utcStart = startLocal.toUTC().toFormat("HH:mm");
        newData[isoDate].utcEnd = endLocal.toUTC().toFormat("HH:mm");
      }

      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const invalid = Object.entries(dateData).filter(
        ([, d]) => !d.start || !d.end
      );
      if (invalid.length) throw new Error("Faltan horas de inicio/fin");

      const sessions = Object.entries(dateData).map(([date, d]) => {
        const localStart = DateTime.fromISO(`${date}T${d.start}`, {
          zone: "local",
        });
        const localEnd = DateTime.fromISO(`${date}T${d.end}`, {
          zone: "local",
        });

        return {
          inicio: localStart.toUTC().toISO(),
          final: localEnd.toUTC().toISO(),
          titulo: d.title || "Clase",
          type: d.type,
          timezone: DateTime.local().zoneName,
        };
      });

      await authFetch(
        `https://server-mot.onrender.com/courses/${selectedCourseId}/dates`,
        {
          method: "POST",
          body: JSON.stringify({ sessions }),
        }
      );
      setIsEditing(false);
      loadDates();
      setModal({
        isOpen: true,
        title: "Éxito",
        message: "Calendario actualizado",
      });
    } catch (err) {
      setModal({ isOpen: true, title: "Error", message: err.message });
    }
  };

  // Función para manejar el acceso seguro a las videollamadas
  const handleJoinClass = async (joinLink, e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const response = await fetch(
        `https://server-mot.onrender.com${joinLink}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include", // permite setear la cookie mot_user_token
          redirect: "follow",
        }
      );

      if (response.redirected) {
        window.open(response.url, "_blank");
      }
    } catch (err) {
      console.error("Error al unirse a clase:", err);
    }
  };

  return (
    <div className="instructor-calendar">
      <h2>Calendario de Clases</h2>
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

          <div className="calendar-wrapper">
            <DayPicker
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
            />
          </div>

          <button onClick={handleSave} className="save-btn">
            Guardar Cambios
          </button>
        </>
      )}

      <div ref={sessionsContainerRef}>
        {Object.entries(dateData)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, data]) => {
            const dateObj = DateTime.fromISO(date);
            const isPast =
              dateObj.startOf("day") < DateTime.local().startOf("day");

            return (
              <div key={date} className="session-card" data-type={data.type}>
                <h4>
                  {dateObj.setLocale("es").toLocaleString(DateTime.DATE_FULL)}
                </h4>
                <p data-type-badge={data.type}>Tipo: {data.type}</p>

                {isEditing ? (
                  <>
                    <input
                      type="time"
                      value={data.start}
                      onChange={(e) =>
                        handleTimeChange(
                          dateObj.toJSDate(),
                          "start",
                          e.target.value
                        )
                      }
                      disabled={isPast || data.recording_url}
                    />
                    <input
                      type="time"
                      value={data.end}
                      onChange={(e) =>
                        handleTimeChange(
                          dateObj.toJSDate(),
                          "end",
                          e.target.value
                        )
                      }
                      disabled={isPast || data.recording_url}
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
                    {data.utcStart && data.utcEnd && (
                      <p className="utc-info">
                        Horario UTC: {data.utcStart} - {data.utcEnd}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p>
                      Hora: {data.start} - {data.end} (tu hora local)
                    </p>
                    <p>Título: {data.title || "Clase"}</p>
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
                  </>
                )}
              </div>
            );
          })}
      </div>

      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <button
              onClick={() =>
                setModal({ isOpen: false, title: "", message: "" })
              }
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCal;
