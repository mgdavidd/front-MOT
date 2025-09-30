import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { applyUserThemeFromCookies } from "../../utils/initUserTheme.js";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const userEncoded = query.get("user");
    const token = query.get("token");

    if (userEncoded && token) {
      try {
        // ✅ Decodificar el string de la URL
        const user = JSON.parse(decodeURIComponent(userEncoded));

        // ✅ Guardar en cookies de forma consistente
        Cookies.set("user", JSON.stringify(user), { 
          expires: 7, 
          secure: true,
          sameSite: 'strict'
        });
        Cookies.set("token", token, { 
          expires: 7, 
          secure: true,
          sameSite: 'strict'
        });

        // ✅ Aplicar tema inmediatamente
        applyUserThemeFromCookies();

        // ✅ Redirigir según el rol
        const userRole = user.rol?.toLowerCase();
        console.log("Usuario autenticado:", user); // Para debug
        
        if (userRole === "profesor") {
          navigate("/instructorNav");
        } else if (userRole === "estudiante") {
          navigate("/studentNav");
        } else {
          console.warn("Rol no reconocido:", userRole);
          navigate("/");
        }
      } catch (err) {
        console.error("Error al procesar OAuth:", err);
        navigate("/?error=oauth_parse");
      }
    } else {
      console.error("Faltan datos en OAuth:", { userEncoded, token });
      navigate("/?error=oauth_missing_data");
    }
  }, [navigate, location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3a5 100%)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#275a57', marginBottom: '1rem' }}>
          Procesando login con Google...
        </h2>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #00b8af',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default OAuthSuccess;