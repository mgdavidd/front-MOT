import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const userEncoded = query.get("user");

    if (userEncoded) {
      try {
        const user = JSON.parse(decodeURIComponent(userEncoded));//tomamos los datos del usuario
        Cookies.set("user", JSON.stringify(user), { expires: 7 });//guardamos en cookies(para no se vulnerables)
        navigate("/profile");
      } catch (err) {
        console.error("Error al parsear usuario desde OAuth", err);
        navigate("/");
      }
    } else {//si no existe
      navigate("/");
    }
  }, [navigate, location]);

  return <div>Procesando login con Google...</div>;
};

export default OAuthSuccess;
