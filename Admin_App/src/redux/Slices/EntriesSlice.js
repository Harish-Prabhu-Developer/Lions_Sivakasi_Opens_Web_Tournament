// // src/redux/slices/EntriesSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";


// // ========================
// // Thunks (Async Actions)
// // ========================
// export const getHeaders = () => ({
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//     "Content-Type": "application/json",
//   },
// });


// export const getEventEntries = createAsyncThunk(
//   "entries/getEventEntries",
//   async ({page, limit}, { rejectWithValue }) => {
//     try {
//       const res = await axios.get(`${API_URL}/api/v1/entry/admin/entries?page=${page}&limit=${limit}`, getHeaders());
//         console.log("Response : ",res);
        
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.msg || "Failed to fetch player entries"
//       );
//     }
//   }
// );




// // 🔹 Initial state
// const initialState = {
//     pagination: null,
//     loading: false,
//     error: null,
//     entries: [],
// };


// const EntriesSlice =createSlice({
//     name: "entries",
//     initialState,
    
// });
