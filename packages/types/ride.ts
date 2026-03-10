export interface Ride {
    id: string;
    driverId: string;
    isActive: boolean;
    maxQueueSize: number;
    explicitFilter: boolean;
  }