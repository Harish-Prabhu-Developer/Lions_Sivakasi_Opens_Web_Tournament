// src/redux/slices/EntriesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants";
import { getHeaders } from "./PlayerSlice";

// ========================
// Thunks (Async Actions)
// ========================

// 1️⃣ Add events (Add to cart)
export const addToEvents = createAsyncThunk(
  "entries/addToEvents",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/v1/entry/create`, payload,getHeaders(), {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Failed to add events to entry"
      );
    }
  }
);

// 2️⃣ Update specific event item (like cart item)
export const updateEventItem = createAsyncThunk(
  "entries/updateEventItem",
  async ({ eventId, updatedData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/v1/entry/update/${eventId}`,
        updatedData,
        getHeaders(),
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Failed to update event item"
      );
    }
  }
);

// 3️⃣ Get player's entries
export const getPlayerEntries = createAsyncThunk(
  "entries/getPlayerEntries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/entry/me`,getHeaders());
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.msg || "Failed to fetch player entries"
      );
    }
  }
);

// ========================
// Slice
// ========================
const EntriesSlice = createSlice({
  name: "entries",
  initialState: {
    entry: null,         // entire entry document
    events: [],          // event items
    player: null,        // player ID/reference
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 🟢 addToEvents
    builder
      .addCase(addToEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.msg;
        if (action.payload.data) {
          state.entry = action.payload.data;
          state.events = action.payload.data.events || [];
          state.player = action.payload.data.player || null;
        }
      })
      .addCase(addToEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 🟢 updateEventItem
    builder
      .addCase(updateEventItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.msg;
        if (action.payload.data) {
          state.entry = action.payload.data;
          state.events = action.payload.data.events || [];
        }
      })
      .addCase(updateEventItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 🟢 getPlayerEntries
    builder
      .addCase(getPlayerEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlayerEntries.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { success, player, events }
        console.log("action :" ,action.payload);
        
        state.player = action.payload.data.player || null;
        state.events = action.payload.data.events || [];
      })
      .addCase(getPlayerEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = EntriesSlice.actions;
export default EntriesSlice.reducer;
