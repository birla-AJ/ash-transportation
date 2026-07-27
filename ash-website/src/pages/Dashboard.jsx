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
  Chip,
  Button,
  Skeleton,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getDashboardStats } from '../api/challansApi';

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
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          {value ?? <Skeleton width={40} />}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate('/add-challan')}
        >
          Add Challan
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Today's Trips" value={stats?.todayTrips} icon={<TodayIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Today's Challans"
            value={stats?.todayChallans}
            icon={<LocalShippingIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Monthly Trips"
            value={stats?.monthlyTrips}
            icon={<CalendarMonthIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Yearly Trips" value={stats?.yearlyTrips} icon={<EventIcon />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Recent Challans
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Challan No.</TableCell>
                    <TableCell>Truck No.</TableCell>
                    <TableCell>Place</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.recentChallans?.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.challanNumber}</TableCell>
                      <TableCell>{c.truckNumber}</TableCell>
                      <TableCell>{c.placeOfDelivery}</TableCell>
                      <TableCell>{new Date(c.challanDate).toLocaleDateString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                  {!stats && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Latest Activity
            </Typography>
            {stats?.latestActivity?.map((c) => (
              <Box
                key={c.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {c.challanNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.truckNumber} → {c.placeOfDelivery}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={new Date(c.updatedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              </Box>
            ))}
            {!stats && <Skeleton height={100} />}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
