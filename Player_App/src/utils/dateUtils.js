// utils/dateUtils.js

/**
 * Converts date from "DD-MM-YYYY" → "YYYY-MM-DD" (for input[type="date"])
 */
export const formatDateForInput = (dob) => {
  if (!dob) return "";
  const [day, month, year] = dob.split("-");
  if (!day || !month || !year) return dob; // fallback for invalid input
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

/**
 * Converts date from "YYYY-MM-DD" → "DD-MM-YYYY" (for saving/display)
 */
export const formatDate = (dob) => {
  if (!dob) return "";
  const [year, month, day] = dob.split("-");
  if (!year || !month || !day) return dob; // fallback
  return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
};


export const formatDateMonth = (date) => {
  if (!date) return ""; // Handle empty values gracefully
  
  const parsedDate = new Date(date); // Convert string to Date object

  if (isNaN(parsedDate.getTime())) {
    console.warn("Invalid date:", date); // Debugging output
    return ""; // Return an empty string for invalid dates
  }

  // Format the date
  const month = parsedDate.toLocaleString("en-US", { month: "short" });
  const day = parsedDate.getDate();
  const year = parsedDate.getFullYear();

  return `${day}-${month}-${year}`;
};

  
  export function dateFormatter(dateString) {
    const inputDate = new Date(dateString);
  
    if (isNaN(inputDate)) {
      return "Invalid Date";
    }
  
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, "0");
    const day = String(inputDate.getDate()).padStart(2, "0");
  
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
