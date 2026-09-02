import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Autocomplete,
} from '@mui/material';
import dayjs from 'dayjs';
import { fetchActiveTransporters } from '../../api/transportersApi';

export default function EditChallanDialog({ challan, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [transporter, setTransporter] = useState(null);
  const [transporters, setTransporters] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (challan) {
      setForm({
        truckNumber: challan.truckNumber,
        placeOfDelivery: challan.placeOfDelivery,
        challanDate: dayjs(challan.challanDate).format('YYYY-MM-DD'),
        challanTime: challan.challanTime,
      });
      setTransporter(challan.transporter || null);
      setError('');
    }
  }, [challan]);

  useEffect(() => {
    fetchActiveTransporters()
      .then((list) => {
        // The challan's current transporter might have since been
        // deactivated — keep it selectable in this dialog even if it's
        // no longer in the active list, so editing doesn't force a change.
        if (challan?.transporter && !list.some((t) => t.id === challan.transporter.id)) {
          setTransporters([challan.transporter, ...list]);
        } else {
          setTransporters(list);
        }
      })
      .catch(() => setTransporters([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challan?.id]);

  if (!form) return null;

  async function handleSave() {
    if (!form.truckNumber.trim() || !form.placeOfDelivery.trim()) {
      setError('Truck Number and Place Of Delivery are required');
      return;
    }
    if (!transporter) {
      setError('Please select a Transporter');
      return;
    }
    setLoading(true);
    try {
      await onSave(challan.id, { ...form, transporterId: transporter.id });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update challan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!challan} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Challan {challan?.challanNumber}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Autocomplete
            options={transporters || []}
            getOptionLabel={(t) => t.name || ''}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={transporter}
            onChange={(_, value) => setTransporter(value)}
            loading={transporters === null}
            renderInput={(params) => <TextField {...params} label="Transporter" required />}
          />
          <TextField
            label="Truck Number"
            fullWidth
            value={form.truckNumber}
            onChange={(e) => setForm((f) => ({ ...f, truckNumber: e.target.value }))}
          />
          <TextField
            label="Place Of Delivery"
            fullWidth
            value={form.placeOfDelivery}
            onChange={(e) => setForm((f) => ({ ...f, placeOfDelivery: e.target.value }))}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.challanDate}
            onChange={(e) => setForm((f) => ({ ...f, challanDate: e.target.value }))}
          />
          <TextField
            label="Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.challanTime}
            onChange={(e) => setForm((f) => ({ ...f, challanTime: e.target.value }))}
          />
        </Stack>
        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          Saving will reprint 4 identical receipts with the updated details.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          Save &amp; Reprint
        </Button>
      </DialogActions>
    </Dialog>
  );
}
