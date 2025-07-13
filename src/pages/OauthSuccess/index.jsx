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
        const user = JSON.parse(decodeURIComponent(userEncoded));
        Cookies.set("user", JSON.stringify(user), { expires: 7 });
        navigate("/profile");
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
