import React, { useEffect, useRef } from 'react';
import { Box, Button, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import Receipt from './Receipt';
import { registerPrint } from '../../api/challansApi';

export default function ReceiptPrintView({ challan, copies = 4, autoPrint = true, onClose }) {
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    if (autoPrint && challan?._id && !hasPrintedRef.current) {
      hasPrintedRef.current = true;
      // slight delay lets the receipt fully render before print dialog opens
      const timer = setTimeout(() => handlePrint(), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challan?._id]);

  async function handlePrint() {
    try {
      if (challan?._id) {
        await registerPrint(challan._id);
      }
    } catch (err) {
      // Printing should still proceed even if the audit call fails
      // eslint-disable-next-line no-console
      console.error('Failed to register print event', err);
    }
    window.print();
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} justifyContent="center" className="no-print" sx={{ py: 2 }}>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print {copies} Copies
        </Button>
        {onClose && (
          <Button variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>
            Close
          </Button>
        )}
      </Stack>
      <div className="receipt-print-container">
        {Array.from({ length: copies }).map((_, i) => (
          <Receipt key={i} challan={challan} />
        ))}
      </div>
    </Box>
  );
}
