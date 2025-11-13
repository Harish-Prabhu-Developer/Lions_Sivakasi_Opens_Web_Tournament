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
  if (!date) return ""; // Handle null/undefined/empty

  let parsedDate;

  // 🧠 Case 1: Already a Date object
  if (date instanceof Date) {
    parsedDate = date;
  } 
  // 🧠 Case 2: String — handle multiple formats
  else if (typeof date === "string") {
    // Trim whitespace
    const cleanDate = date.trim();

    // Case: DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = cleanDate.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (dmyMatch) {
      const [_, day, month, year] = dmyMatch;
      parsedDate = new Date(`${year}-${month}-${day}`); // Convert to ISO-safe
    } 
    // Case: YYYY-MM-DD or YYYY/MM/DD
    else if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(cleanDate)) {
      parsedDate = new Date(cleanDate.replace(/-/g, "/"));
    } 
    // Fallback
    else {
      parsedDate = new Date(cleanDate);
    }
  } 
  // 🧠 Case 3: Timestamp number
  else if (typeof date === "number") {
    parsedDate = new Date(date);
  } 
  else {
    return "";
  }

  if (isNaN(parsedDate.getTime())) {
    console.warn("Invalid date:", date);
    return "";
  }

  const day = parsedDate.getDate().toString().padStart(2, "0");
  const month = parsedDate.toLocaleString("en-US", { month: "short" });
  const year = parsedDate.getFullYear();

  return `${day}-${month}-${year}`;
};

  
export const toDateInputValue = (dob) => {
  if (!dob) return "";
  // If it's already ISO-like, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;
  // If DD-MM-YYYY, convert:
  if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
    const [day, month, year] = dob.split("-");
    return `${year}-${month}-${day}`;
  }
  return ""; // fallback for any other format
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
