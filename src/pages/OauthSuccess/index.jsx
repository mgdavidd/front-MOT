import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const userEncoded = query.get("user");
    const token = query.get("token"); // 👈 asegúrate que tu backend también te mande el token en la URL

    if (userEncoded) {
      try {
        // ✅ Decodificar el string de la URL
        const user = JSON.parse(decodeURIComponent(userEncoded));

        // ✅ Guardar en cookies de la misma forma que en Login.jsx
        Cookies.set("user", JSON.stringify(user), { expires: 7 });
        if (token) {
          Cookies.set("token", token, { expires: 7 });
        }

        // ✅ Redirigir según el rol
        const userRole = user.rol?.toLowerCase();
        if (userRole === "profesor") {
          navigate("/instructorNav");
        } else if (userRole === "estudiante") {
          navigate("/studentNav");
        } else {
          navigate("/"); // Rol no reconocido
        }
      } catch (err) {
        console.error("Error al parsear usuario desde OAuth", err);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate, location]);

  return <div>Procesando login con Google...</div>;
};

export default OAuthSuccess;
