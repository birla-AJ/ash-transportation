import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Skeleton,
  Stack,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getDashboardStats } from '../api/challansApi';
import TodayListModal from '../components/Dashboard/TodayListModal';

function StatCard({ label, value, icon, color, onClick }) {
  const clickable = !!onClick;
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': clickable
          ? { transform: 'translateY(-2px)', boxShadow: 4 }
          : undefined,
      }}
    >
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
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="h4" fontWeight={700}>
          {value ?? <Skeleton width={40} />}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Box>
      {clickable && <ChevronRightIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />}
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState({ open: false, title: '' });
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats({}));
  }, []);

  // const activity = stats?.latestActivity?.length ? stats.latestActivity : stats?.recentChallans || [];
  const activity = stats?.recentChallans || [];

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate('/add-challan')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Add Challan
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Today's Trips"
            value={stats?.todayTrips}
            icon={<TodayIcon />}
            color="primary"
            onClick={() => setModal({ open: true, title: "Today's Trips" })}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Today's Challans"
            value={stats?.todayChallans}
            icon={<LocalShippingIcon />}
            color="secondary"
            onClick={() => setModal({ open: true, title: "Today's Challans" })}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Monthly Trips" value={stats?.monthlyTrips} icon={<CalendarMonthIcon />} color="success" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Yearly Trips" value={stats?.yearlyTrips} icon={<EventIcon />} color="warning" />
        </Grid>
      </Grid>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Recent Activity
          </Typography>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Challan No.
                </TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  Username
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
              {activity.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{c.challanNumber}</TableCell>
                  <TableCell>{c.createdByUser?.name || '—'}</TableCell>
                  <TableCell>{c.truckNumber}</TableCell>
                  <TableCell>{c.placeOfDelivery}</TableCell>
                  <TableCell>
                    {new Date(c.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  {/* <TableCell>{c.challanTime}</TableCell> */}
                </TableRow>
              ))}
              {!stats && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton />
                  </TableCell>
                </TableRow>
              )}
              {stats && activity.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <Typography color="text.secondary">No activity yet</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <TodayListModal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ open: false, title: '' })}
      />
    </Box>
  );
}
