// src/utils/authHelpers.js

/**
 * ✅ Check if user is logged in based on localStorage.
 * Returns `true` if both token and user exist.
 */
export const IsLoggedIn = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

/**
 * ✅ Logs out the user: clears localStorage and optionally redirects.
 * Can be used both with or without AuthContext.
 */
export const Logout = (redirect = true) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Optional: redirect to login/register page
  if (redirect) {
    window.location.href = "/register";
  }
};

export const getUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};
