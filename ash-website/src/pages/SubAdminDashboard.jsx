import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Switch,
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
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  fetchSubAdminDashboard,
  setAdminSignature,
  setAdminStatus,
} from '../api/adminManagementApi';
import {
  createTransporter,
  fetchAllTransporters,
  setTransporterStatus,
} from '../api/transportersApi';
import AddUserDialog from '../components/AdminManagement/AddUserDialog';
import DeleteUserDialog from '../components/AdminManagement/DeleteUserDialog';
import EditSignatureDialog from '../components/AdminManagement/EditSignatureDialog';
import AddTransporterDialog from '../components/AdminManagement/AddTransporterDialog';

function StatCard({ label, value, icon, color }) {
  return (
    <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
      <Box
        sx={{
          bgcolor: `${color}.main`,
          color: '#fff',
          borderRadius: 2,
          p: 1.4,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" fontWeight={700}>
          {value ?? <Skeleton width={40} />}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function SubAdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [admins, setAdmins] = useState(null);
  const [transporters, setTransporters] = useState(null);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [addTransporterOpen, setAddTransporterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [signatureTarget, setSignatureTarget] = useState(null);

  async function loadDashboard() {
    const data = await fetchSubAdminDashboard();
    setDashboard(data);
  }

  async function loadAdmins() {
    const data = await fetchAdmins();
    setAdmins(data);
  }

  async function loadTransporters() {
    const data = await fetchAllTransporters();
    setTransporters(data);
  }

  useEffect(() => {
    loadDashboard().catch(() => setDashboard({ totalChallans: 0, totalAdmins: 0, perAdmin: [] }));
    loadAdmins().catch(() => setAdmins([]));
    loadTransporters().catch(() => setTransporters([]));
  }, []);

  async function refreshAdmins() {
    await Promise.all([loadDashboard(), loadAdmins()]);
  }

  async function handleCreateAdmin(payload) {
    await createAdmin(payload);
    await refreshAdmins();
  }

  async function handleDeleteAdmin(id) {
    await deleteAdmin(id);
    await refreshAdmins();
  }

  async function handleToggleActive(admin) {
    await setAdminStatus(admin.id, !admin.isActive);
    await refreshAdmins();
  }

  async function handleSaveSignature(id, signatureImage) {
    await setAdminSignature(id, signatureImage);
    await refreshAdmins();
  }

  async function handleCreateTransporter(payload) {
    await createTransporter(payload);
    await loadTransporters();
  }

  async function handleToggleTransporter(transporter) {
    await setTransporterStatus(transporter.id, !transporter.isActive);
    await loadTransporters();
  }

  const chartData = (dashboard?.perAdmin || []).map((a) => ({
    name: a.name.length > 12 ? `${a.name.slice(0, 12)}…` : a.name,
    fullName: a.name,
    Challans: a.challanCount,
  }));

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        {/* <Typography variant="h5" fontWeight={700}>
          Sub Admin
        </Typography> */}
        <Typography variant="body2" color="text.secondary">
          Admin performance overview, account &amp; transporter management
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <StatCard
            label="Total Challans"
            value={dashboard?.totalChallans}
            icon={<LocalShippingIcon />}
            color="secondary"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard
            label="Total Admins"
            value={dashboard?.totalAdmins}
            icon={<GroupIcon />}
            color="primary"
          />
        </Box>
      </Stack>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Challans Created — by Admin
        </Typography>
        {dashboard === null ? (
          <Skeleton height={280} />
        ) : chartData.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography color="text.secondary">No admin activity yet</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <ChartTooltip
                formatter={(value) => [value, 'Challans']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
              />
              <Bar dataKey="Challans" fill="#C97B2E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* ---- Admins ---- */}
      <Paper sx={{ overflow: 'hidden', mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, pb: 1.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BadgeIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              Admins {admins ? `(${admins.length})` : ''}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => setAddAdminOpen(true)}
          >
            Add Admin
          </Button>
        </Stack>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 780 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Signature
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Name
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Email
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Challans Created
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Status
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
              {admins === null && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton />
                  </TableCell>
                </TableRow>
              )}
              {admins?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No Admins yet — add one to get started.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {admins?.map((a) => {
                const perf = dashboard?.perAdmin?.find((p) => p.userId === a.id);
                return (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Tooltip title={a.signatureImage ? 'Change signature' : 'Add signature'}>
                        <Box
                          onClick={() => setSignatureTarget(a)}
                          sx={{ cursor: 'pointer', display: 'inline-flex' }}
                        >
                          {a.signatureImage ? (
                            <Avatar
                              variant="rounded"
                              src={a.signatureImage}
                              sx={{ width: 56, height: 32, bgcolor: 'grey.100' }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              icon={<EditIcon sx={{ fontSize: 14 }} />}
                              label="Add"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: 'primary.main' }}>
                          {a.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={600}>{a.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{perf?.challanCount ?? 0}</TableCell>
                    <TableCell>
                      <Tooltip title={a.isActive ? 'Deactivate' : 'Activate'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Switch
                            size="small"
                            checked={a.isActive}
                            onChange={() => handleToggleActive(a)}
                            color="success"
                          />
                          <Chip
                            size="small"
                            label={a.isActive ? 'Active' : 'Inactive'}
                            color={a.isActive ? 'success' : 'default'}
                            variant={a.isActive ? 'filled' : 'outlined'}
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete Admin">
                        <IconButton color="error" onClick={() => setDeleteTarget(a)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ---- Transporters ---- */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, pb: 1.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingOutlinedIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              Transporters {transporters ? `(${transporters.length})` : ''}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => setAddTransporterOpen(true)}
          >
            Add Transporter
          </Button>
        </Stack>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Name
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Address
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transporters === null && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Skeleton />
                  </TableCell>
                </TableRow>
              )}
              {transporters?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No transporters yet — add one so Admins can select it on challans.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {transporters?.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{t.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 340 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {t.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t.isActive ? 'Deactivate' : 'Activate'}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Switch
                          size="small"
                          checked={t.isActive}
                          onChange={() => handleToggleTransporter(t)}
                          color="success"
                        />
                        <Chip
                          size="small"
                          label={t.isActive ? 'Active' : 'Inactive'}
                          color={t.isActive ? 'success' : 'default'}
                          variant={t.isActive ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <AddUserDialog
        open={addAdminOpen}
        entityLabel="Admin"
        withSignature
        onClose={() => setAddAdminOpen(false)}
        onSubmit={handleCreateAdmin}
      />
      <DeleteUserDialog
        user={deleteTarget}
        entityLabel="Admin"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAdmin}
      />
      <EditSignatureDialog
        admin={signatureTarget}
        onClose={() => setSignatureTarget(null)}
        onSubmit={handleSaveSignature}
      />
      <AddTransporterDialog
        open={addTransporterOpen}
        onClose={() => setAddTransporterOpen(false)}
        onSubmit={handleCreateTransporter}
      />
    </Box>
  );
}
