import React, { useState } from 'react';
import { TextField, Button, Stack } from '@mui/material';

export default function AssignmentForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');

  return (
    <Stack component="form" spacing={2} onSubmit={(e) => { e.preventDefault(); onSave({ title, description, dueDate }); }}>
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <TextField label="Description" multiline minRows={3} value={description} onChange={e => setDescription(e.target.value)} required />
      <TextField label="Due Date" type="date" InputLabelProps={{ shrink: true }} value={dueDate} onChange={e => setDueDate(e.target.value)} required />
      <div>
        <Button type="submit" variant="contained">Save</Button>
        <Button type="button" onClick={onCancel} sx={{ ml: 1 }}>Cancel</Button>
      </div>
    </Stack>
  );
}