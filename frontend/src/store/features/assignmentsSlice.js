import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/client';

export const fetchAssignments = createAsyncThunk('assignments/fetch', async (status) => {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  return await api(`/api/assignments${q}`);
});

export const createAssignment = createAsyncThunk('assignments/create', async (payload) => {
  return await api('/api/assignments', { method: 'POST', body: JSON.stringify(payload) });
});

export const updateAssignment = createAsyncThunk('assignments/update', async ({ id, payload }) => {
  return await api(`/api/assignments/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
});

export const publishAssignment = createAsyncThunk('assignments/publish', async (id) => {
  return await api(`/api/assignments/${id}/publish`, { method: 'POST' });
});

export const completeAssignment = createAsyncThunk('assignments/complete', async (id) => {
  return await api(`/api/assignments/${id}/complete`, { method: 'POST' });
});

export const deleteAssignment = createAsyncThunk('assignments/delete', async (id) => {
  return await api(`/api/assignments/${id}`, { method: 'DELETE' });
});

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchAssignments.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchAssignments.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })
      .addCase(createAssignment.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateAssignment.fulfilled, (s, a) => {
        const i = s.items.findIndex(x => x._id === a.payload._id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(publishAssignment.fulfilled, (s, a) => {
        const i = s.items.findIndex(x => x._id === a.payload._id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(completeAssignment.fulfilled, (s, a) => {
        const i = s.items.findIndex(x => x._id === a.payload._id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(deleteAssignment.fulfilled, (s, a) => {
        s.items = s.items.filter(x => x._id !== a.payload._id);
      });
  }
});

export default assignmentsSlice.reducer;