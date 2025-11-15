// redux/Slices/PlayerSlices.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants";
import { toast } from "react-hot-toast";

// Get token from localStorage
const getToken = () => localStorage.getItem("bulkapp_token");

// Async thunks
export const fetchPlayers = createAsyncThunk(
  "player/fetchPlayers",
  async (searchTerm = "", { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/api/v2/academy/player?search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPlayer = createAsyncThunk(
  "player/fetchPlayer",
  async (playerId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/api/v2/academy/player/${playerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPlayer = createAsyncThunk(
  "player/createPlayer",
  async (playerData, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/api/v2/academy/player/create`,
        playerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePlayer = createAsyncThunk(
  "player/updatePlayer",
  async ({ id, playerData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/api/v2/academy/player/${id}`,
        playerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePlayer = createAsyncThunk(
  "player/deletePlayer",
  async (playerId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.delete(
        `${API_URL}/api/v2/academy/player/${playerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPlayerStats = createAsyncThunk(
  "player/fetchPlayerStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/api/v2/academy/player/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Helper function to add default states to player
const addDefaultStates = (player) => {
  return {
    ...player,
    states: {
      entries: {
        total: 0,
        events: {
          total: 0,
          paid: 0,
          pending: 0,
          counts: {
            singles: 0,
            doubles: 0,
            mixedDoubles: 0,
            total: 0
          }
        }
      },
      payment: {
        totalPaid: 0,
        totalPending: 0,
        paymentStatus: 'unpaid'
      }
    }
  };
};

const playerSlice = createSlice({
  name: "player",
  initialState: {
    players: [],
    currentPlayer: null,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPlayer: (state) => {
      state.currentPlayer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Players
      .addCase(fetchPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle both old and new response structures
        const playersData = action.payload.data?.players || [];
        
        // Ensure all players have the states object
        state.players = playersData.map(player => {
          // If player already has states, keep them, otherwise add default states
          return player.states ? player : addDefaultStates(player);
        });
        
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to fetch players";
        toast.error(action.payload?.msg || "Failed to fetch players");
      })

      // Fetch Single Player
      .addCase(fetchPlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayer.fulfilled, (state, action) => {
        state.loading = false;
        const playerData = action.payload.data?.player || null;
        
        // Ensure the player has states object
        state.currentPlayer = playerData ? 
          (playerData.states ? playerData : addDefaultStates(playerData)) : 
          null;
      })
      .addCase(fetchPlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to fetch player";
        toast.error(action.payload?.msg || "Failed to fetch player");
      })

      // Create Player
      .addCase(createPlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlayer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data?.player) {
          // Add default states for new player
          const newPlayer = addDefaultStates(action.payload.data.player);
          state.players.push(newPlayer);
        }
        toast.success(action.payload.msg || "Player created successfully");
      })
      .addCase(createPlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to create player";
        toast.error(action.payload?.msg || "Failed to create player");
      })

      // Update Player
      .addCase(updatePlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlayer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data?.player) {
          const updatedPlayer = action.payload.data.player;
          const index = state.players.findIndex(p => p.id === updatedPlayer.id);
          
          if (index !== -1) {
            // Preserve the existing states when updating player
            const existingStates = state.players[index].states;
            state.players[index] = {
              ...updatedPlayer,
              states: existingStates // Keep existing states
            };
          }
          
          // Also update currentPlayer if it's the same player
          if (state.currentPlayer && state.currentPlayer.id === updatedPlayer.id) {
            state.currentPlayer = {
              ...updatedPlayer,
              states: state.currentPlayer.states // Keep existing states
            };
          }
        }
        toast.success(action.payload.msg || "Player updated successfully");
      })
      .addCase(updatePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to update player";
        toast.error(action.payload?.msg || "Failed to update player");
      })

      // Delete Player
      .addCase(deletePlayer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlayer.fulfilled, (state, action) => {
        state.loading = false;
        const playerId = action.meta.arg;
        state.players = state.players.filter(player => player.id !== playerId);
        
        if (state.currentPlayer && state.currentPlayer.id === playerId) {
          state.currentPlayer = null;
        }
        
        toast.success(action.payload.msg || "Player deleted successfully");
      })
      .addCase(deletePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to delete player";
        toast.error(action.payload?.msg || "Failed to delete player");
      })

      // Fetch Player Stats
      .addCase(fetchPlayerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data?.stats || null;
      })
      .addCase(fetchPlayerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Failed to fetch stats";
        toast.error(action.payload?.msg || "Failed to fetch stats");
      });
  },
});

export const { clearError, clearCurrentPlayer } = playerSlice.actions;
export default playerSlice.reducer;