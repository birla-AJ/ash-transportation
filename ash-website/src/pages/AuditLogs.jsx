import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  TablePagination,
} from '@mui/material';
import apiClient from '../api/apiClient';

const ACTION_COLORS = {
  CHALLAN_CREATE: 'success',
  CHALLAN_UPDATE: 'info',
  CHALLAN_DELETE: 'error',
  CHALLAN_REPRINT: 'default',
  USER_LOGIN: 'default',
  USER_LOGOUT: 'default',
};

export default function AuditLogs() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    apiClient
      .get('/audit-logs', { params: { page: page + 1, limit } })
      .then(({ data }) => {
        setRows(data.data.items);
        setTotal(data.data.meta.total);
      });
  }, [page, limit]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Audit Logs
      </Typography>
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Performed By</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>When</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Chip size="small" label={log.action} color={ACTION_COLORS[log.action] || 'default'} />
                  </TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell>{log.performedByUser?.name || '—'}</TableCell>
                  <TableCell>{log.reason || '—'}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
}
