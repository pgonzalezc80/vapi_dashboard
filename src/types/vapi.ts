export interface Call {
  id: string;
  startedAt: string;
  recordingUrl: string;
  cost: number;
  customer?: {
    number: string;
  };
  endedReason?: string;
  status: string;
}

export type ListCallsResponse = Call[]; 