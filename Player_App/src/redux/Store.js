import { configureStore } from '@reduxjs/toolkit'
import EntriesSlice from './Slices/EntriesSlice';
import PlayerSlice from './Slices/PlayerSlice';
const Store = configureStore({
  reducer: {
    entries:EntriesSlice,
    player:PlayerSlice,
  },
});


export default Store;