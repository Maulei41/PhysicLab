import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

export default function EditRecordModal({ open, record, recordIndex, onSave, onClose }) {
  const [name, setName] = useState('');
  const [sid, setSid] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setName(record.name);
      setSid(record.sid);
      setErrors({});
    }
  }, [record, open]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!sid.trim()) {
      newErrors.sid = 'SID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(recordIndex, name.trim(), sid.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Student Record</DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          autoFocus
        />
        <TextField
          label="Student ID (SID)"
          value={sid}
          onChange={(e) => setSid(e.target.value)}
          error={!!errors.sid}
          helperText={errors.sid}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
