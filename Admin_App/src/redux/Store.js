import { configureStore } from '@reduxjs/toolkit'
import EntriesSlice from './Slices/EntriesSlice';
const Store = configureStore({
  reducer: {
    entries:EntriesSlice,
  },
});


export default Store;