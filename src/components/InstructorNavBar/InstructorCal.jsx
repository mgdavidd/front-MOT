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
  const originalDataRef = useRef({}); // guarda estado original para diff
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [eventType, setEventType] = useState("Clase en vivo");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });
  const sessionsContainerRef = useRef(null);
  const [saving, setSaving] = useState(false); // evita envíos dobles

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("token")}`,
    };
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

        // intentar parsear room_id desde join_link si existe:
        let parsedRoomId = null;
        try {
          if (s.join_link) {
            // formato: /courses/:id/join/:room_id
            const parts = s.join_link.split("/");
            parsedRoomId = parts[parts.length - 1];
          }
        } catch (_) {
          parsedRoomId = null;
        }

        newDateData[localDateKey] = {
          start: inicioLocal.toFormat("HH:mm"),
          end: finalLocal.toFormat("HH:mm"),
          utcStart: inicioUTC.toFormat("HH:mm"),
          utcEnd: finalUTC.toFormat("HH:mm"),
          title: s.titulo,
          type: s.tipo,
          join_link: s.join_link,
          recording_url: s.recording_url,
          room_id: parsedRoomId,
        };

        newSelectedDates.push(inicioLocal.toJSDate());
      });

      setSelectedDates(newSelectedDates);
      setDateData(newDateData);
      originalDataRef.current = JSON.parse(JSON.stringify(newDateData)); // snapshot para diff
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

    // borrar fechas que el usuario desmarcó
    Object.keys(newData).forEach((d) => {
      if (!newDates.some((x) => DateTime.fromJSDate(x).toISODate() === d)) {
        delete newData[d];
      }
    });

    // agregar nuevas fechas
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
          room_id: null,
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
          room_id: null,
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

  // Helper: compara dateData con snapshot original y devuelve solo sesiones modificadas/nuevas
  const buildChangedSessions = () => {
    const changed = [];
    const original = originalDataRef.current || {};
    for (const [date, d] of Object.entries(dateData)) {
      const orig = original[date];
      // si no existe en original -> nueva
      const isNew = !orig;
      // si cambiaron start/end/title
      const changedTime =
        !isNew &&
        (d.start !== orig.start || d.end !== orig.end || (d.title || "") !== (orig.title || ""));
      if (isNew || changedTime) {
        // validación local
        if (!d.start || !d.end) continue;
        const localStart = DateTime.fromISO(`${date}T${d.start}`, { zone: "local" });
        const localEnd = DateTime.fromISO(`${date}T${d.end}`, { zone: "local" });
        if (!localStart.isValid || !localEnd.isValid || localEnd <= localStart) continue;

        changed.push({
          inicio: localStart.toUTC().toISO(),
          final: localEnd.toUTC().toISO(),
          titulo: d.title || "Clase",
          type: d.type || "Clase en vivo",
          timezone: DateTime.local().zoneName,
          // si ya tenemos room_id, la enviamos para que el server la reutilice
          room_id: d.room_id || null,
          // incluir localDate para el server si lo necesita
          localDate: date,
        });
      }
    }
    return changed;
  };

  const handleSave = async () => {
    if (saving) return;
    try {
      setSaving(true);

      const sessions = buildChangedSessions();
      if (sessions.length === 0) {
        setModal({ isOpen: true, title: "Info", message: "No hay cambios para guardar." });
        return;
      }

      // Enviamos UN solo POST con todas las sesiones modificadas/nuevas
      await authFetch(
        `https://server-mot.onrender.com/courses/${selectedCourseId}/dates`,
        {
          method: "POST",
          body: JSON.stringify({ sessions }),
        }
      );

      // Recargar horarios (snapshot actualizado)
      await loadDates();
      setIsEditing(false);
      setModal({
        isOpen: true,
        title: "Éxito",
        message: "Calendario actualizado",
      });
    } catch (err) {
      setModal({ isOpen: true, title: "Error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Función para manejar el acceso seguro a las videollamadas
  const handleJoinClass = (joinLink, e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) return;

    // Navegación directa → el proxy se encarga de validar y redirigir
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

          <button onClick={handleSave} className="save-btn" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
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
