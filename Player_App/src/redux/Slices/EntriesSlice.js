// EntriesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // All entries submitted by users
  entries: [],
  
  // Current entry being created (temporary state)
  currentEntry: {
    id: null,
    selectedEvents: [],
    player: {},
    partners: {},
    paymentInfo: {
      amount: 0,
      screenshot: null,
      extractedData: null,
      uploadedAt: null,
    },
    status: "draft", // draft, submitted, pending, approved, rejected
    submittedAt: null,
    verifiedAt: null,
    verifiedBy: null,
    rejectionReason: null,
  },

  // Admin filters and view
  adminFilters: {
    status: "all", // all, pending, approved, rejected
    searchQuery: "",
    dateRange: { start: null, end: null },
    category: "all",
  },

  // UI state
  loading: false,
  error: null,
};

const EntriesSlice = createSlice({
  name: "Entries",
  initialState,
  reducers: {
    // ============= USER ACTIONS =============
    
    // Step 1: Add/Update selected events
    setSelectedEvents: (state, action) => {
      state.currentEntry.selectedEvents = action.payload;
      state.currentEntry.paymentInfo.amount = action.payload.reduce(
        (sum, e) => sum + (["singles"].includes(e.type.toLowerCase()) ? 800 : 1400),
        0
      );
    },

    // Step 2: Update player details
    updatePlayerDetails: (state, action) => {
      state.currentEntry.player = {
        ...state.currentEntry.player,
        ...action.payload,
      };
    },

    // Step 2: Update partner details
    updatePartnerDetails: (state, action) => {
      const { category, data } = action.payload;
      state.currentEntry.partners[category] = {
        ...state.currentEntry.partners[category],
        ...data,
      };
    },

    // Step 3: Upload payment screenshot
    uploadPaymentScreenshot: (state, action) => {
      state.currentEntry.paymentInfo = {
        ...state.currentEntry.paymentInfo,
        screenshot: action.payload.screenshot,
        extractedData: action.payload.extractedData,
        uploadedAt: new Date().toISOString(),
      };
    },

    // Submit entry (final step)
    submitEntry: (state) => {
      const newEntry = {
        ...state.currentEntry,
        id: `ENTRY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      
      state.entries.push(newEntry);
      
      // Reset current entry
      state.currentEntry = {
        ...initialState.currentEntry,
      };
    },

    // Reset current entry (cancel/start over)
    resetCurrentEntry: (state) => {
      state.currentEntry = {
        ...initialState.currentEntry,
      };
    },

    // ============= ADMIN ACTIONS =============

    // Approve a single event within an entry
    approveEvent: (state, action) => {
      const { entryId, eventIndex } = action.payload;
      const entry = state.entries.find((e) => e.id === entryId);
      
      if (entry && entry.selectedEvents[eventIndex]) {
        if (!entry.selectedEvents[eventIndex].verificationStatus) {
          entry.selectedEvents[eventIndex].verificationStatus = {};
        }
        
        entry.selectedEvents[eventIndex].verificationStatus = {
          status: "approved",
          verifiedAt: new Date().toISOString(),
          verifiedBy: action.payload.adminId,
        };

        // Check if all events are approved
        const allApproved = entry.selectedEvents.every(
          (evt) => evt.verificationStatus?.status === "approved"
        );
        
        if (allApproved) {
          entry.status = "approved";
          entry.verifiedAt = new Date().toISOString();
          entry.verifiedBy = action.payload.adminId;
        }
      }
    },

    // Reject a single event within an entry
    rejectEvent: (state, action) => {
      const { entryId, eventIndex, reason, adminId } = action.payload;
      const entry = state.entries.find((e) => e.id === entryId);
      
      if (entry && entry.selectedEvents[eventIndex]) {
        if (!entry.selectedEvents[eventIndex].verificationStatus) {
          entry.selectedEvents[eventIndex].verificationStatus = {};
        }
        
        entry.selectedEvents[eventIndex].verificationStatus = {
          status: "rejected",
          verifiedAt: new Date().toISOString(),
          verifiedBy: adminId,
          reason: reason,
        };

        // Check if any event is rejected
        const anyRejected = entry.selectedEvents.some(
          (evt) => evt.verificationStatus?.status === "rejected"
        );
        
        if (anyRejected) {
          entry.status = "rejected";
          entry.rejectionReason = reason;
        }
      }
    },

    // Approve entire entry (all events at once)
    approveEntireEntry: (state, action) => {
      const { entryId, adminId } = action.payload;
      const entry = state.entries.find((e) => e.id === entryId);
      
      if (entry) {
        entry.selectedEvents.forEach((evt) => {
          evt.verificationStatus = {
            status: "approved",
            verifiedAt: new Date().toISOString(),
            verifiedBy: adminId,
          };
        });
        
        entry.status = "approved";
        entry.verifiedAt = new Date().toISOString();
        entry.verifiedBy = adminId;
      }
    },

    // Reject entire entry
    rejectEntireEntry: (state, action) => {
      const { entryId, reason, adminId } = action.payload;
      const entry = state.entries.find((e) => e.id === entryId);
      
      if (entry) {
        entry.selectedEvents.forEach((evt) => {
          evt.verificationStatus = {
            status: "rejected",
            verifiedAt: new Date().toISOString(),
            verifiedBy: adminId,
            reason: reason,
          };
        });
        
        entry.status = "rejected";
        entry.rejectionReason = reason;
      }
    },

    // Update admin filters
    setAdminFilters: (state, action) => {
      state.adminFilters = {
        ...state.adminFilters,
        ...action.payload,
      };
    },

    // ============= UTILITY ACTIONS =============

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Load entries (for admin view)
    loadEntries: (state, action) => {
      state.entries = action.payload;
    },
  },
});

export const {
  // User actions
  setSelectedEvents,
  updatePlayerDetails,
  updatePartnerDetails,
  uploadPaymentScreenshot,
  submitEntry,
  resetCurrentEntry,
  
  // Admin actions
  approveEvent,
  rejectEvent,
  approveEntireEntry,
  rejectEntireEntry,
  setAdminFilters,
  
  // Utility actions
  setLoading,
  setError,
  clearError,
  loadEntries,
} = EntriesSlice.actions;

export default EntriesSlice.reducer;
