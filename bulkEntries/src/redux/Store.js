//src/redux/Store.js
import { configureStore } from '@reduxjs/toolkit'
import PlayerSlice from './Slices/PlayerSlices';
const Store = configureStore({
  reducer: {
    player:PlayerSlice,
  },
});


export default Store;