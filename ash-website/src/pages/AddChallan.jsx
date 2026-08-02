import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Dialog,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { createChallan } from '../api/challansApi';
import ReceiptPrintView from '../components/Receipt/ReceiptPrintView';

const emptyForm = { truckNumber: '', placeOfDelivery: '' };

export default function AddChallan() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [printChallan, setPrintChallan] = useState(null);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setError('');
    setSuccess('');
  }

  function validate() {
    if (!form.truckNumber.trim()) return 'Truck Number is required';
    if (!form.placeOfDelivery.trim()) return 'Place Of Delivery is required';
    return '';
  }

  async function handleSave(andPrint) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const challan = await createChallan(form);
      setSuccess(`Challan ${challan.challanNumber} saved successfully`);
      setForm(emptyForm);
      if (andPrint) {
        setPrintChallan(challan);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save challan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Add Challan
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 560 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <TextField
            label="Truck Number"
            required
            fullWidth
            autoFocus
            value={form.truckNumber}
            onChange={handleChange('truckNumber')}
            placeholder="e.g. GJ01AB1234"
          />
          <TextField
            label="Place Of Delivery"
            required
            fullWidth
            value={form.placeOfDelivery}
            onChange={handleChange('placeOfDelivery')}
            placeholder="e.g. Rajkot Site"
          />

          <Alert severity="info" variant="outlined">
            Challan Number, Date and Time are generated automatically on save.
          </Alert>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SaveIcon />}
              disabled={saving}
              onClick={() => handleSave(false)}
            >
              Save
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<PrintIcon />}
              disabled={saving}
              onClick={() => handleSave(true)}
            >
              Save &amp; Print
            </Button>
            <Button
              variant="text"
              size="large"
              color="inherit"
              startIcon={<RestartAltIcon />}
              onClick={resetForm}
              disabled={saving}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        fullScreen
        open={!!printChallan}
        onClose={() => setPrintChallan(null)}
        PaperProps={{ sx: { bgcolor: '#e9ebea' } }}
      >
        {printChallan && (
          <ReceiptPrintView challan={printChallan} copies={4} onClose={() => setPrintChallan(null)} />
        )}
      </Dialog>
    </Box>
  );
}
