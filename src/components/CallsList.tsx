import React, { useEffect, useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { Call } from '../types/vapi.ts';
import { vapiService } from '../services/vapiService.ts';

export const CallsList: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vapiService.listCalls();
      console.log('Response in component:', response);
      setCalls(response);
    } catch (error) {
      console.error('Error fetching calls:', error);
      setError('Error loading calls. Please try again.');
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const getTotalCost = (cost: number) => {
    return cost.toFixed(2);
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

  if (loading && calls.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

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

        {calls.length === 0 ? (
          <Typography align="center" color="textSecondary">
            No calls found
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {calls.map((call) => (
              <Grid item xs={12} key={call.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          {call.customer?.number || 'Unknown Number'}
                        </Typography>
                        <Typography color="textSecondary">
                          Started: {formatDate(call.startedAt)}
                        </Typography>
                        <Typography color="textSecondary">
                          Status: {call.status}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: { xs: 'flex-start', sm: 'flex-end' } 
                      }}>
                        <Chip 
                          label={`Cost: $${getTotalCost(call.cost)}`}
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                        {call.endedReason && (
                          <Chip 
                            label={`Ended: ${call.endedReason}`}
                            color="secondary"
                            sx={{ mb: 1 }}
                          />
                        )}
                        {call.recordingUrl && (
                          <audio controls src={call.recordingUrl}>
                            Your browser does not support the audio element.
                          </audio>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}; 