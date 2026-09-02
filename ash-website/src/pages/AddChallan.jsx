import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Dialog,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { createChallan } from '../api/challansApi';
import { fetchActiveTransporters } from '../api/transportersApi';
import ReceiptPrintView from '../components/Receipt/ReceiptPrintView';

const emptyForm = { truckNumber: '', placeOfDelivery: '' };

export default function AddChallan() {
  const [form, setForm] = useState(emptyForm);
  // Transporter selection lives outside `form` and is NOT reset after each
  // save — an admin usually runs a whole batch of challans for the same
  // transporter, so keeping it selected is what makes back-to-back receipts
  // quick. They can still change it any time.
  const [transporter, setTransporter] = useState(null);
  const [transporters, setTransporters] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [printChallan, setPrintChallan] = useState(null);

  useEffect(() => {
    fetchActiveTransporters()
      .then((list) => {
        setTransporters(list);
        // Only one transporter on file? Pick it automatically — one less
        // click for the common case, still changeable via the dropdown.
        if (list.length === 1) setTransporter(list[0]);
      })
      .catch(() => setTransporters([]));
  }, []);

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
    if (!transporter) return 'Please select a Transporter';
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
      const challan = await createChallan({ ...form, transporterId: transporter.id });
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
          <Autocomplete
            options={transporters || []}
            getOptionLabel={(t) => t.name || ''}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={transporter}
            onChange={(_, value) => setTransporter(value)}
            loading={transporters === null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Transporter"
                required
                placeholder="Select transporter"
                helperText={
                  transporters?.length === 0
                    ? 'No transporters yet — ask your Sub Admin to add one'
                    : ' '
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {transporters === null ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
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
