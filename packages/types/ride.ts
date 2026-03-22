export interface Ride {
    id: string; // unique ride code
    driverId: string; // driver name or ID
    //isActive: boolean;
    //maxQueueSize: number;
    //explicitFilter: boolean;
    passengers: string[]; // array of passenger names
  }

  export const rides: Record<string, Ride> = {}; // key: rideId