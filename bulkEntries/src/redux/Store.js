//src/redux/Store.js
import { configureStore } from '@reduxjs/toolkit'
import PlayerSlice from './Slices/PlayerSlice';
const Store = configureStore({
  reducer: {

    player:PlayerSlice,
  },
});


export default Store;