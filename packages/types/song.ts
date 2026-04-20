export interface Song {
  id: string;
  rideId: string;
  trackId: string;

  title: string;
  artist: string;
  albumArt?: string;

  votes: number;
  addedAt: string; // 👈 change to string (important!)
  queuedInSpotify: boolean;
}