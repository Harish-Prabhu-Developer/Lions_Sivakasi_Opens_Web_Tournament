// src/redux/slices/PlayerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants";

export const fetchPlayers = createAsyncThunk(
    "player/fetchPlayers",
    async (token) => {
        const response = await axios.get(`${API_URL}/api/v2/academy/player`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    }
);

const playerSlice = createSlice({
    name: "player",
    initialState: {
        players: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchPlayers.fulfilled, (state, action) => {
            state.players = action.payload;
        });
    },
});

export default playerSlice.reducer;