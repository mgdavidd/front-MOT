import Cookies from "js-cookie";

export function getUserTheme() {
  const cookie = Cookies.get("user");
  if (!cookie) return null;

  try {
    const user = JSON.parse(cookie); // Eliminamos decodeURIComponent
    return user.color_perfil || null;
  } catch (error) {
    console.error("Error al analizar tema del usuario:", error);
    return null;
  }
}

export function applyUserThemeFromCookies() {
  const color = getUserTheme();
  if (color) {
    document.documentElement.style.setProperty('--color-primary', color);
  }
}