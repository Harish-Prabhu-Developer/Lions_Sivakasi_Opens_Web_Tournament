//src/redux/Store.js
import { configureStore } from '@reduxjs/toolkit'
import PlayerSlice from './Slices/PlayerSlices';
import EntriesSlice from './Slices/EntriesSlice'; 
const Store = configureStore({
  reducer: {
    player:PlayerSlice,
    entries: EntriesSlice,
  },
});


export default Store;