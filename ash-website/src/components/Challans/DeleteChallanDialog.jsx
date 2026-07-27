import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
} from '@mui/material';

export default function DeleteChallanDialog({ challan, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) {
      setError('A reason is required to delete a challan');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(challan._id, reason.trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!challan} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Challan {challan?.challanNumber}</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone. The challan number{' '}
          <strong>{challan?.challanNumber}</strong> will never be reused.
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Please provide a reason for deletion:
        </Typography>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Duplicate entry created by mistake"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={loading}>
          Delete Challan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
