import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import DescriptionIcon from '@mui/icons-material/Description';
import { previewExport, downloadExportFile } from '../../api/exportSettingsApi';

export default function ExportPreviewDialog({ open, filters, onClose }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    if (open) {
      setLoading(true);
      previewExport(filters)
        .then(setPreview)
        .finally(() => setLoading(false));
    } else {
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleDownload(format) {
    setDownloading(format);
    const ext = format === 'excel' ? 'xlsx' : format;
    try {
      await downloadExportFile(format, filters, `challans-${Date.now()}.${ext}`);
    } finally {
      setDownloading('');
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Export Preview {preview ? `(${preview.count} rows)` : ''}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}
        {!loading && preview && preview.rows.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No records match the current filters.
          </Typography>
        )}
        {!loading && preview && preview.rows.length > 0 && (
          <TableContainer sx={{ maxHeight: 420 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {preview.columns.map((col) => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.rows.slice(0, 200).map((row, idx) => (
                  <TableRow key={idx} hover>
                    {Object.values(row).map((val, i) => (
                      <TableCell key={i}>{String(val)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {!loading && preview && preview.rows.length > 200 && (
          <Typography variant="caption" color="text.secondary">
            Showing first 200 of {preview.count} rows. Download the full file to see all records.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ mr: 'auto' }}>
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            disabled={!!downloading || loading}
            onClick={() => handleDownload('csv')}
          >
            {downloading === 'csv' ? 'Downloading…' : 'CSV'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<GridOnIcon />}
            disabled={!!downloading || loading}
            onClick={() => handleDownload('excel')}
          >
            {downloading === 'excel' ? 'Downloading…' : 'Excel'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            disabled={!!downloading || loading}
            onClick={() => handleDownload('pdf')}
          >
            {downloading === 'pdf' ? 'Downloading…' : 'PDF'}
          </Button>
        </Stack>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
