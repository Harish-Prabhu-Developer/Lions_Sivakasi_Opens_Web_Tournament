import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants";
import { toast } from "react-hot-toast";

// Get token from localStorage
const getToken = () => localStorage.getItem("bulkapp_token");

// Async thunks for Entry operations
export const addToAcademyEvents = createAsyncThunk(
  "entries/addToAcademyEvents",
  async ({ playerID, events }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/api/v2/academy/entry/add/${playerID}`,
        { events },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAcademyPlayerEntries = createAsyncThunk(
  "entries/getAcademyPlayerEntries",
  async (playerID, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/api/v2/academy/entry/${playerID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToAcademyEventPayment = createAsyncThunk(
  "entries/addToAcademyEventPayment",
  async ({ playerID, entryID, paymentData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/api/v2/academy/payment/add-payment/${playerID}/${entryID}`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAcademyEntryPayments = createAsyncThunk(
  "entries/getAcademyEntryPayments",
  async ({ playerID, entryID }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/api/v2/academy/payment/${playerID}/${entryID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update entry status
export const updateEntryStatus = createAsyncThunk(
  "entries/updateEntryStatus",
  async ({ entryID, status }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/api/v2/academy/entry/${entryID}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const EntriesSlice = createSlice({
  name: "entries",
  initialState: {
    entries: [],
    currentPlayerEntries: [],
    currentEntry: null,
    payments: [],
    loading: false,
    error: null,
    paymentLoading: false,
    paymentError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
    },
    clearEntries: (state) => {
      state.currentPlayerEntries = [];
      state.currentEntry = null;
    },
    clearPayments: (state) => {
      state.payments = [];
    },
    setCurrentEntry: (state, action) => {
      state.currentEntry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to Academy Events
      .addCase(addToAcademyEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToAcademyEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Update or add the entry to current player entries
        const existingIndex = state.currentPlayerEntries.findIndex(
          entry => entry._id === action.payload.data._id
        );
        if (existingIndex !== -1) {
          state.currentPlayerEntries[existingIndex] = action.payload.data;
        } else {
          state.currentPlayerEntries.push(action.payload.data);
        }
        state.currentEntry = action.payload.data;
        toast.success(action.payload.msg || "Events added successfully!");
      })
      .addCase(addToAcademyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to add events";
        toast.error(action.payload?.msg || "Failed to add events");
      })

      // Get Academy Player Entries
      .addCase(getAcademyPlayerEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAcademyPlayerEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlayerEntries = action.payload.data.entries || [];
        // Set the latest entry as current entry if available
        if (action.payload.data.entries && action.payload.data.entries.length > 0) {
          state.currentEntry = action.payload.data.entries[0];
        }
      })
      .addCase(getAcademyPlayerEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to fetch player entries";
      })

      // Add to Academy Event Payment
      .addCase(addToAcademyEventPayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(addToAcademyEventPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        
        // Update the entry with payment information
        const updatedEntry = action.payload.data.entry;
        if (updatedEntry) {
          const entryIndex = state.currentPlayerEntries.findIndex(
            entry => entry._id === updatedEntry._id
          );
          if (entryIndex !== -1) {
            state.currentPlayerEntries[entryIndex] = updatedEntry;
          }
          state.currentEntry = updatedEntry;
        }
        
        // Add payments to state
        if (action.payload.data.payments) {
          state.payments = action.payload.data.payments;
        }
        
        toast.success(action.payload.msg || "Payment added successfully!");
      })
      .addCase(addToAcademyEventPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload?.msg || "Failed to process payment";
        toast.error(action.payload?.msg || "Failed to process payment");
      })

      // Get Academy Entry Payments
      .addCase(getAcademyEntryPayments.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(getAcademyEntryPayments.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.payments = action.payload.data.payments || [];
      })
      .addCase(getAcademyEntryPayments.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload?.msg || "Failed to fetch payments";
      })

      // Update Entry Status
      .addCase(updateEntryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntryStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the entry in current player entries
        const updatedEntry = action.payload.data;
        const entryIndex = state.currentPlayerEntries.findIndex(
          entry => entry._id === updatedEntry._id
        );
        if (entryIndex !== -1) {
          state.currentPlayerEntries[entryIndex] = updatedEntry;
        }
        if (state.currentEntry && state.currentEntry._id === updatedEntry._id) {
          state.currentEntry = updatedEntry;
        }
        toast.success("Entry status updated successfully!");
      })
      .addCase(updateEntryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to update entry status";
        toast.error(action.payload?.msg || "Failed to update entry status");
      });
  },
});

export const { clearError, clearEntries, clearPayments, setCurrentEntry } = EntriesSlice.actions;
export default EntriesSlice.reducer;