import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';

export default function AddTransporterDialog({ open, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setName('');
    setAddress('');
    setError('');
    setLoading(false);
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), address: address.trim() });
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transporter');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Transporter</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Transporter Name"
            placeholder="e.g. SONU MONU ROADLINES"
            fullWidth
            required
            margin="dense"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            label="Address"
            placeholder="e.g. SANDASINGHA, SASON, SAMBAPUR, ODISHA - 768003"
            fullWidth
            required
            multiline
            minRows={2}
            margin="dense"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            helperText="Printed exactly as entered on the challan"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding…' : 'Add Transporter'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
