// PlayerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants/index";

// 🔹 Helper to include JWT in headers
export const getHeaders = () => ({
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



// ==========================
// 🔹 Partner Change Request (POST)
// ==========================
export const PartnerChangeReq = createAsyncThunk(
  "player/PartnerChangeReq",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/partner/request`,
        formData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("❌ PartnerChangeReq Error:", error);
      return rejectWithValue(
        error.response?.data?.msg || "Failed to submit partner change request"
      );
    }
  }
);

// ==========================
// 🔹 Get My Partner Change Requests (GET)
// ==========================
export const PartnerChangeRes = createAsyncThunk(
  "player/PartnerChangeRes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/partner/my-requests`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("❌ PartnerChangeRes Error:", error);
      return rejectWithValue(
        error.response?.data?.msg || "Failed to fetch partner change requests"
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
  partnerChangeRequests: [], // 🆕 for storing fetched requests
  partnerChangeSuccess: false, // 🆕 for submit success
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
      state.partnerChangeSuccess = false;
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
      })
            // --------------------------
      // Partner Change Request (POST)
      // --------------------------
      .addCase(PartnerChangeReq.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.partnerChangeSuccess = false;
      })
      .addCase(PartnerChangeReq.fulfilled, (state, action) => {
        state.loading = false;
        state.partnerChangeSuccess = true;
        state.partnerChangeRequests.unshift(action.payload.data);
      })
      .addCase(PartnerChangeReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.partnerChangeSuccess = false;
      })

      // --------------------------
      // Get My Partner Change Requests (GET)
      // --------------------------
      .addCase(PartnerChangeRes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(PartnerChangeRes.fulfilled, (state, action) => {
        state.loading = false;
        state.partnerChangeRequests = action.payload.data || [];
      })
      .addCase(PartnerChangeRes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPlayerState } = PlayerSlice.actions;
export default PlayerSlice.reducer;
