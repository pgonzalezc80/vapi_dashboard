import React, { useEffect, useState } from 'react';
import { format, isValid, parseISO, differenceInSeconds } from 'date-fns';
import { 
  Box, 
  Container, 
  Typography, 
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid
} from '@mui/material';
import { 
  Refresh,
  Phone as PhoneIcon,
  PhoneMissed as PhoneMissedIcon,
  Timer as TimerIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Call } from '../types/vapi.ts';
import { vapiService } from '../services/vapiService.ts';

export const CallsList: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showOnlyRecorded, setShowOnlyRecorded] = useState(false);
  const [hideNoAnswer, setHideNoAnswer] = useState(false);

  const fetchCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vapiService.listCalls();
      setCalls(response);
      setFilteredCalls(response);
    } catch (error) {
      console.error('Error fetching calls:', error);
      setError('Error loading calls. Please try again.');
      setCalls([]);
      setFilteredCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  useEffect(() => {
    filterCalls();
  }, [startDate, endDate, showOnlyRecorded, hideNoAnswer, calls]);

  const filterCalls = () => {
    let filtered = [...calls];

    if (startDate) {
      filtered = filtered.filter(call => 
        dayjs(call.startedAt).isAfter(startDate.startOf('day'))
      );
    }

    if (endDate) {
      filtered = filtered.filter(call => 
        dayjs(call.startedAt).isBefore(endDate.endOf('day'))
      );
    }

    if (showOnlyRecorded) {
      filtered = filtered.filter(call => call.recordingUrl);
    }

    if (hideNoAnswer) {
      filtered = filtered.filter(call => call.endedReason !== 'customer-did-not-answer');
    }

    setFilteredCalls(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return format(date, 'PPpp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setShowOnlyRecorded(false);
    setHideNoAnswer(false);
  };

  const getCallStats = () => {
    const totalCalls = filteredCalls.length;
    const unansweredCalls = filteredCalls.filter(call => 
      call.endedReason === 'customer-did-not-answer'
    ).length;
    const longCalls = filteredCalls.filter(call => {
      const duration = call.endedAt ? 
        differenceInSeconds(new Date(call.endedAt), new Date(call.startedAt)) : 0;
      return duration > 20;
    }).length;
    const totalCost = filteredCalls.reduce((sum, call) => sum + call.cost, 0);

    // Calculamos los porcentajes
    const unansweredPercentage = totalCalls > 0 
      ? ((unansweredCalls / totalCalls) * 100).toFixed(1)
      : '0';
    const longCallsPercentage = totalCalls > 0 
      ? ((longCalls / totalCalls) * 100).toFixed(1)
      : '0';

    return {
      totalCalls,
      unansweredCalls,
      unansweredPercentage,
      longCalls,
      longCallsPercentage,
      totalCost
    };
  };

  const stats = getCallStats();

  const StatCard = ({ title, value, subvalue, icon, color }: {
    title: string;
    value: string | number;
    subvalue?: string;  // Nuevo prop opcional para el porcentaje
    icon: React.ReactNode;
    color: string;
  }) => (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: `${color}.main`,
        color: 'white',
        '& .MuiSvgIcon-root': {
          color: 'white',
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        '& .MuiTypography-root': {
          color: 'white',
          opacity: 0.9
        }
      }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h4" 
        component="div" 
        sx={{ 
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        {value}
      </Typography>
      {subvalue && (
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            color: 'white',
            opacity: 0.9,
            mt: 0.5
          }}
        >
          {subvalue}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Calls History
          </Typography>
          <IconButton 
            onClick={fetchCalls} 
            disabled={loading}
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : <Refresh />}
          </IconButton>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Calls"
              value={stats.totalCalls}
              icon={<PhoneIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Unanswered"
              value={stats.unansweredCalls}
              subvalue={`${stats.unansweredPercentage}% of total`}
              icon={<PhoneMissedIcon />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Long Calls (>20s)"
              value={stats.longCalls}
              subvalue={`${stats.longCallsPercentage}% of total`}
              icon={<TimerIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Cost"
              value={`$${stats.totalCost.toFixed(2)}`}
              icon={<MoneyIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 4 }}>
          <Stack spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems="center"
              >
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: { size: 'small' }
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: { size: 'small' }
                  }}
                />
              </Stack>
            </LocalizationProvider>

            <Divider />

            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyRecorded}
                    onChange={(e) => setShowOnlyRecorded(e.target.checked)}
                  />
                }
                label="Show only calls with recording"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideNoAnswer}
                    onChange={(e) => setHideNoAnswer(e.target.checked)}
                  />
                }
                label="Hide unanswered calls"
              />
              <IconButton 
                onClick={handleClearFilters}
                color="primary"
                size="small"
              >
                <Refresh />
              </IconButton>
            </FormGroup>
          </Stack>
        </Paper>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="calls table">
            <TableHead>
              <TableRow>
                <TableCell>Phone Number</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>End Reason</TableCell>
                <TableCell align="right">Cost</TableCell>
                <TableCell>Recording</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {loading ? (
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    ) : (
                      'No calls found'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalls.map((call) => (
                  <TableRow
                    key={call.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {call.customer?.number || 'Unknown'}
                    </TableCell>
                    <TableCell>{formatDate(call.startedAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={call.status}
                        color={call.status === 'ended' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {call.endedReason && (
                        <Chip 
                          label={call.endedReason}
                          color="secondary"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      ${call.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {call.recordingUrl && (
                        <audio controls src={call.recordingUrl} style={{ height: '32px' }}>
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}; 