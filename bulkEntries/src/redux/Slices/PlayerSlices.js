// src/redux/slices/PlayerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants";
import { toast } from "react-hot-toast";

// Get token from localStorage
const getToken = () => localStorage.getItem("bulkapp_token");

// Fetch all players
export const fetchPlayers = createAsyncThunk(
  "player/fetchPlayers",
  async (searchTerm = "") => {
    const token = getToken();
    const url = searchTerm 
      ? `${API_URL}/api/v2/academy/player?search=${encodeURIComponent(searchTerm)}`
      : `${API_URL}/api/v2/academy/player`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.players;
  }
);

// Fetch player stats
export const fetchPlayerStats = createAsyncThunk(
  "player/fetchPlayerStats",
  async () => {
    const token = getToken();
    const response = await axios.get(`${API_URL}/api/v2/academy/player/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.stats;
  }
);

// Create new player
export const createPlayer = createAsyncThunk(
  "player/createPlayer",
  async (playerData, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/api/v2/academy/player/create`,
        playerData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.msg);
      return response.data.data.player;
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to create player");
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update player - FIXED VERSION
export const updatePlayer = createAsyncThunk(
  "player/updatePlayer",
  async ({ id, playerData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      console.log("Updating player with data:", { id, playerData }); // Debug log
      
      const response = await axios.put(
        `${API_URL}/api/v2/academy/player/${id}`,
        playerData, // Send the entire playerData object
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      toast.success(response.data.msg);
      return response.data.data.player;
    } catch (error) {
      console.error("Update player error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to update player");
      return rejectWithValue(error.response?.data);
    }
  }
);


// Delete player
export const deletePlayer = createAsyncThunk(
  "player/deletePlayer",
  async (playerId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.delete(
        `${API_URL}/api/v2/academy/player/${playerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.msg);
      return playerId;
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete player");
      return rejectWithValue(error.response?.data);
    }
  }
);

// Fetch single player
export const fetchPlayer = createAsyncThunk(
  "player/fetchPlayer",
  async (playerId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_URL}/api/v2/academy/player/${playerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data.player;
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch player");
      return rejectWithValue(error.response?.data);
    }
  }
);

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
    clearCurrentPlayer: (state) => {
      state.currentPlayer = null;
    },
    clearError: (state) => {
      state.error = null;
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
        state.players = action.payload;
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Player Stats
      .addCase(fetchPlayerStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Create Player
      .addCase(createPlayer.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPlayer.fulfilled, (state, action) => {
        state.loading = false;
        state.players.push(action.payload);
      })
      .addCase(createPlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || action.error.message;
      })
      // Update Player
      .addCase(updatePlayer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePlayer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.players.findIndex(player => player.id === action.payload.id);
        if (index !== -1) {
          state.players[index] = action.payload;
        }
        if (state.currentPlayer && state.currentPlayer.id === action.payload.id) {
          state.currentPlayer = action.payload;
        }
      })
      .addCase(updatePlayer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || action.error.message;
      })
      // Delete Player
      .addCase(deletePlayer.fulfilled, (state, action) => {
        state.players = state.players.filter(player => player.id !== action.payload);
      })
      // Fetch Single Player
      .addCase(fetchPlayer.fulfilled, (state, action) => {
        state.currentPlayer = action.payload;
      });
  },
});

export const { clearCurrentPlayer, clearError } = playerSlice.actions;
export default playerSlice.reducer;