//Matias trabaja desde aqui
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookieUser = Cookies.get("user");
    if (cookieUser) {
      try {
        setUser(JSON.parse(cookieUser));
      } catch (err) {
        console.error("Error al parsear la cookie del usuario", err);
      }
    }
  }, []);

  if (!user) return <div>Cargando perfil...</div>;

  return (
    <div>
      <h1>Perfil de {user.nombre}</h1>
      <p>Correo: {user.email}</p>
      <p>Rol: {user.rol}</p>
    </div>
  );
};

export default Profile;
