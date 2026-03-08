export interface Ride {
    id: string;
    driverId: string;
    isActive: boolean;
    maxQueueSize: number;
    explicitFilter: boolean;
  }
  
  export interface SongRequest {
    id: string;
    rideId: string;
    trackId: string;
    status: "pending" | "approved" | "rejected" | "played";
  }