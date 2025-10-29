// PlayerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants/index";

// 🔹 Helper to include JWT in headers
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});

// 🔹 Async thunk: Update Player Profile
export const updatePlayerForm = createAsyncThunk(
  "player/updatePlayerForm",
  async (formData, { rejectWithValue }) => {
    try {
      // 🟢 Call backend API
      const response = await axios.put(
        `${API_URL}/api/v1/user/updatePlayer`,
        formData,
        getHeaders()
      );

      const { data } = response;

      // ✅ Save new JWT token if present
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // ✅ Update "user" data in localStorage cleanly
      if (data?.data?.user) {
        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
        console.log("Store : ",storedUser);
        
        const updatedUser = {
          ...storedUser,
          name: data.data.user.name,
          dob: data.data.user.dob,
          TNBAID: data.data.user.TnBaId,
          academyName: data.data.user.academyName,
          place: data.data.user.place,
          district: data.data.user.district,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return data; // Return the full response (contains success, message, data.user, token)
    } catch (error) {
      console.error("❌ Update player form error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update player form"
      );
    }
  }
);

// 🔹 Initial state
const initialState = {
  loading: false,
  error: null,
  success: false,
  playerData: null,
};

// 🔹 Player Slice
const PlayerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    clearPlayerState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePlayerForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePlayerForm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.playerData = action.payload.data?.user || null;
      })
      .addCase(updatePlayerForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearPlayerState } = PlayerSlice.actions;
export default PlayerSlice.reducer;
