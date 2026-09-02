import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const MAX_SIGNATURE_BYTES = 300 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EditSignatureDialog({ admin, onClose, onSubmit }) {
  const [signatureImage, setSignatureImage] = useState(admin?.signatureImage || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e) {
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

  async function handleSave() {
    if (!signatureImage) {
      setError('Choose an image first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(admin.id, signatureImage);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save signature');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!admin} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Signature — {admin?.name}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {signatureImage ? (
            <Avatar variant="rounded" src={signatureImage} sx={{ width: 110, height: 60, bgcolor: 'grey.100' }} />
          ) : (
            <Avatar variant="rounded" sx={{ width: 110, height: 60, bgcolor: 'grey.100' }}>
              <UploadFileIcon color="disabled" />
            </Avatar>
          )}
          <Button component="label" size="small" variant="outlined">
            {signatureImage ? 'Change' : 'Upload'} Image
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          This appears on every challan printed by this admin.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
