import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { createSubAdmin, deleteSubAdmin, fetchSubAdmins } from '../api/adminManagementApi';
import AddUserDialog from '../components/AdminManagement/AddUserDialog';
import DeleteUserDialog from '../components/AdminManagement/DeleteUserDialog';

export default function SuperAdminDashboard() {
  const [subAdmins, setSubAdmins] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    const data = await fetchSubAdmins();
    setSubAdmins(data);
  }

  useEffect(() => {
    load().catch(() => setSubAdmins([]));
  }, []);

  async function handleCreate(payload) {
    await createSubAdmin(payload);
    await load();
  }

  async function handleDelete(id) {
    await deleteSubAdmin(id);
    await load();
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Super Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Sub Admin accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setAddOpen(true)}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Add Sub Admin
        </Button>
      </Stack>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupervisorAccountIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Sub Admins {subAdmins ? `(${subAdmins.length})` : ''}
          </Typography>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Name
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Email
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Created
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subAdmins === null && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton />
                  </TableCell>
                </TableRow>
              )}
              {subAdmins?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No Sub Admins yet — add one to get started.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {subAdmins?.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: 'secondary.main' }}>
                        {s.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography fontWeight={600}>{s.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete Sub Admin">
                      <IconButton color="error" onClick={() => setDeleteTarget(s)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <AddUserDialog
        open={addOpen}
        entityLabel="Sub Admin"
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
      />
      <DeleteUserDialog
        user={deleteTarget}
        entityLabel="Sub Admin"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
