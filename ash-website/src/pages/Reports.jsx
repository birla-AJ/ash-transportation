import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import '../agGridSetup';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Dialog,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { listChallans, updateChallan, deleteChallan } from '../api/challansApi';
import EditChallanDialog from '../components/Challans/EditChallanDialog';
import DeleteChallanDialog from '../components/Challans/DeleteChallanDialog';
import ExportPreviewDialog from '../components/Challans/ExportPreviewDialog';
import ReceiptPrintView from '../components/Receipt/ReceiptPrintView';

const DURATIONS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export default function Reports() {
  const gridRef = useRef(null);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [truckNumber, setTruckNumber] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [editChallan, setEditChallan] = useState(null);
  const [deleteChallanTarget, setDeleteChallanTarget] = useState(null);
  const [printChallan, setPrintChallan] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  const currentFilters = useMemo(
    () => ({
      truckNumber: truckNumber || undefined,
      duration: duration || undefined,
      startDate: duration === 'custom' ? startDate : undefined,
      endDate: duration === 'custom' ? endDate : undefined,
    }),
    [truckNumber, duration, startDate, endDate],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listChallans({
        ...currentFilters,
        page: 1,
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setRowData(result.items);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleEditSave(id, payload) {
    const updated = await updateChallan(id, payload);
    setEditChallan(null);
    await loadData();
    setPrintChallan(updated);
  }

  async function handleDeleteConfirm(id, reason) {
    await deleteChallan(id, reason);
    setDeleteChallanTarget(null);
    await loadData();
  }

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Challan Number',
        field: 'challanNumber',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        minWidth: 160,
        flex: 1,
      },
      {
        headerName: 'Truck Number',
        field: 'truckNumber',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'Place',
        field: 'placeOfDelivery',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        minWidth: 180,
        flex: 1,
      },
      {
        headerName: 'Date',
        field: 'challanDate',
        filter: 'agDateColumnFilter',
        floatingFilter: true,
        minWidth: 130,
        flex: 1,
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString('en-IN') : ''),
      },
      {
        headerName: 'Time',
        field: 'createdAt',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        minWidth: 100,
        flex: 1,
        valueFormatter: (p) =>
          p.value
            ? new Date(p.value).toLocaleTimeString('en-IN', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : '',
      },
      // {
      //   headerName: 'Created At',
      //   field: 'createdAt',
      //   filter: 'agDateColumnFilter',
      //   floatingFilter: true,
      //   minWidth: 170,
      //   flex: 1,
      //   valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString('en-IN') : ''),
      // },
      // {
      //   headerName: 'Updated At',
      //   field: 'updatedAt',
      //   filter: 'agDateColumnFilter',
      //   floatingFilter: true,
      //   minWidth: 170,
      //   flex: 1,
      //   valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString('en-IN') : ''),
      // },
      {
        headerName: 'Actions',
        field: 'actions',
        sortable: false,
        filter: false,
        floatingFilter: false,
        minWidth: 160,
        flex: 1,
        pinned: 'right',
        cellRenderer: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setEditChallan(params.data)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reprint">
              <IconButton size="small" onClick={() => setPrintChallan(params.data)}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setDeleteChallanTarget(params.data)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
    }),
    [],
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            label="Truck Number"
            value={truckNumber}
            onChange={(e) => setTruckNumber(e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <TextField
            size="small"
            select
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {DURATIONS.map((d) => (
              <MenuItem key={d.value} value={d.value}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>
          {duration === 'custom' && (
            <>
              <TextField
                size="small"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <TextField
                size="small"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1 }}>
        <div className="ag-theme-quartz" style={{ height: 620, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination
            paginationPageSize={50}
            paginationPageSizeSelector={[25, 50, 100, 200]}
            animateRows
            loading={loading}
          />
        </div>
      </Paper>

      <EditChallanDialog challan={editChallan} onClose={() => setEditChallan(null)} onSave={handleEditSave} />
      <DeleteChallanDialog
        challan={deleteChallanTarget}
        onClose={() => setDeleteChallanTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
      <ExportPreviewDialog open={exportOpen} filters={currentFilters} onClose={() => setExportOpen(false)} />

      <Dialog fullScreen open={!!printChallan} onClose={() => setPrintChallan(null)} PaperProps={{ sx: { bgcolor: '#e9ebea' } }}>
        {printChallan && (
          <ReceiptPrintView challan={printChallan} copies={4} onClose={() => setPrintChallan(null)} />
        )}
      </Dialog>
    </Box>
  );
}
