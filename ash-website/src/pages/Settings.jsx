import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  MenuItem,
  Grid,
  Avatar,
  Skeleton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import PrintIcon from '@mui/icons-material/Print';
import { getSettings, updateSettings } from '../api/exportSettingsApi';

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{icon}</Avatar>
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function Settings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSettings().then(setForm);
  }, []);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        companyName: form.companyName,
        companyAddress: form.companyAddress,
        companyPhone: form.companyPhone,
        copiesPerPrint: Number(form.copiesPerPrint),
        printerType: form.printerType,
        printerName: form.printerName,
        printerWidthMm: Number(form.printerWidthMm),
        printerCalibration: form.printerCalibration,
      };
      const updated = await updateSettings(payload);
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

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {!form ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Skeleton height={40} sx={{ mb: 2 }} />
              <Skeleton height={56} sx={{ mb: 2 }} />
              <Skeleton height={56} sx={{ mb: 2 }} />
              <Skeleton height={56} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Skeleton height={40} sx={{ mb: 2 }} />
              <Skeleton height={56} sx={{ mb: 2 }} />
              <Skeleton height={56} sx={{ mb: 2 }} />
              <Skeleton height={56} />
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<BusinessIcon />}
                title="Company Info"
                subtitle="Shown on printed receipts and reports"
              />
              <Stack spacing={2.5}>
                <TextField label="Company Name" value={form.companyName || ''} onChange={set('companyName')} fullWidth />
                <TextField
                  label="Company Address"
                  value={form.companyAddress || ''}
                  onChange={set('companyAddress')}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <TextField label="Company Phone" value={form.companyPhone || ''} onChange={set('companyPhone')} fullWidth />
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<PrintIcon />}
                title="Printing"
                subtitle="Receipt copies and printer configuration"
              />
              <Stack spacing={2.5}>
                <TextField
                  label="Copies Per Print"
                  type="number"
                  value={form.copiesPerPrint ?? ''}
                  onChange={set('copiesPerPrint')}
                  fullWidth
                />
                <TextField
                  select
                  label="Printer Type"
                  value={form.printerType || ''}
                  onChange={set('printerType')}
                  fullWidth
                >
                  <MenuItem value="ESCPOS">ESC/POS Thermal</MenuItem>
                  <MenuItem value="USB_RAW">USB Raw / Standard Printer</MenuItem>
                </TextField>
                <TextField label="Printer Name" value={form.printerName || ''} onChange={set('printerName')} fullWidth />
                <TextField
                  label="Printer Width (mm)"
                  type="number"
                  value={form.printerWidthMm ?? ''}
                  onChange={set('printerWidthMm')}
                  fullWidth
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {saving ? 'Saving…' : 'Save Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
