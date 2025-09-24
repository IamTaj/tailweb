import { configureStore } from '@reduxjs/toolkit';
import assignmentsReducer from './features/assignmentsSlice';

export default configureStore({
  reducer: {
    assignments: assignmentsReducer
  }
});