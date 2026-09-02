import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';

export default function DeleteUserDialog({ user, entityLabel, onClose, onConfirm }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setError('');
    setLoading(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to delete this ${entityLabel.toLowerCase()}`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!user} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete {entityLabel}</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: error ? 2 : 0 }}>
          This will permanently remove <strong>{user?.name}</strong> ({user?.email}) and cannot
          be undone.
        </Alert>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Deleting…' : `Delete ${entityLabel}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
