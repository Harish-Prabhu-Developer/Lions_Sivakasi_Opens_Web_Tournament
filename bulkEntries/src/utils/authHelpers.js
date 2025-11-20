// src/utils/authHelpers.js

/**
 * ✅ Check if user is logged in based on localStorage.
 * Returns `true` if both token and user exist.
 */
export const IsLoggedIn = () => {
  const token = localStorage.getItem("bulkapp_token");
  const user = localStorage.getItem("user_bulkapp_Data");
  return !!(token && user);
};

/**
 * ✅ Logs out the user: clears localStorage and optionally redirects.
 * Can be used both with or without AuthContext.
 */
export const Logout = (redirect = true) => {
  localStorage.removeItem("bulkapp_token");
  localStorage.removeItem("user_bulkapp_Data");

  // Optional: redirect to login/register page
  if (redirect) {
    window.location.href = "/auth?activeTab=login";
  }
};

export const getUser = () => {
  try {
    const storedUser = localStorage.getItem("user_bulkapp_Data");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};
