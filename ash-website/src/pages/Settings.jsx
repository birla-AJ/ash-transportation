import React, { useEffect, useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Stack, Alert, MenuItem, Divider } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getSettings, updateSettings } from '../api/exportSettingsApi';

export default function Settings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSettings().then(setForm);
  }, []);

  if (!form) return null;

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateSettings(form);
      setForm(updated);
      setMessage('Settings saved successfully');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 560 }}>
        {message && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Company Info
        </Typography>
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <TextField label="Company Name" value={form.companyName} onChange={set('companyName')} fullWidth />
          <TextField label="Company Address" value={form.companyAddress} onChange={set('companyAddress')} fullWidth />
          <TextField label="Company Phone" value={form.companyPhone} onChange={set('companyPhone')} fullWidth />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Printing
        </Typography>
        <Stack spacing={2.5}>
          <TextField
            label="Copies Per Print"
            type="number"
            value={form.copiesPerPrint}
            onChange={set('copiesPerPrint')}
            fullWidth
          />
          <TextField
            select
            label="Printer Type"
            value={form.printerType}
            onChange={set('printerType')}
            fullWidth
          >
            <MenuItem value="ESCPOS">ESC/POS Thermal</MenuItem>
            <MenuItem value="USB_RAW">USB Raw / Standard Printer</MenuItem>
          </TextField>
          <TextField label="Printer Name" value={form.printerName} onChange={set('printerName')} fullWidth />
          <TextField
            label="Printer Width (mm)"
            type="number"
            value={form.printerWidthMm}
            onChange={set('printerWidthMm')}
            fullWidth
          />
        </Stack>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{ mt: 3 }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </Paper>
    </Box>
  );
}
