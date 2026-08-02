import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { listChallans } from '../../api/challansApi';

export default function TodayListModal({ open, onClose, title }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listChallans({ duration: 'today', limit: 200, sortBy: 'challanDate', sortOrder: 'desc' })
      .then((res) => setItems(res?.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: '#fff',
        }}
      >
        {title}
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: { xs: '100%', sm: 480 } }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Challan No.
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Truck No.
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Place of Delivery
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Time
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Nothing recorded for today yet</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                items.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.challanNumber}</TableCell>
                    <TableCell>{c.truckNumber}</TableCell>
                    <TableCell>{c.placeOfDelivery}</TableCell>
                    <TableCell>
                      {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
