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
  InputAdornment,
  IconButton,
  Typography,
  Avatar,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const MAX_SIGNATURE_BYTES = 300 * 1024; // 300KB — keeps the DB row small & receipts fast to load

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generic "create a user" dialog, reused for both Sub Admin creation
 * (Super Admin dashboard) and Admin creation (Sub Admin dashboard).
 * Pass `withSignature` to also collect a signature image — only Admins
 * print receipts, so Sub Admin creation skips this field.
 */
export default function AddUserDialog({ open, entityLabel, withSignature, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signatureImage, setSignatureImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setSignatureImage('');
    setError('');
    setLoading(false);
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

  async function handleSignatureChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIGNATURE_BYTES) {
      setError('Signature image should be under 300KB — use a small, cropped PNG/JPG.');
      e.target.value = '';
      return;
    }
    setError('');
    const dataUrl = await readFileAsDataUrl(file);
    setSignatureImage(dataUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(withSignature ? { signatureImage: signatureImage || undefined } : {}),
      });
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to create ${entityLabel.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add {entityLabel}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Full Name"
            fullWidth
            required
            margin="dense"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {withSignature && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Signature (optional — used on every challan this admin prints)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {signatureImage ? (
                  <Avatar
                    variant="rounded"
                    src={signatureImage}
                    sx={{ width: 72, height: 40, bgcolor: 'grey.100' }}
                  />
                ) : (
                  <Avatar variant="rounded" sx={{ width: 72, height: 40, bgcolor: 'grey.100' }}>
                    <UploadFileIcon fontSize="small" color="disabled" />
                  </Avatar>
                )}
                <Button component="label" size="small" variant="outlined">
                  {signatureImage ? 'Change' : 'Upload'} Image
                  <input type="file" hidden accept="image/*" onChange={handleSignatureChange} />
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Can also be added later from the admin's row.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creating…' : `Add ${entityLabel}`}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
