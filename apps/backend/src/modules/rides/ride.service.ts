import { randomUUID } from "crypto";

interface Ride {
  rideId: string
  joinCode: string
  queueLength: number
  maxQueueSize: number
}

const rides = new Map<string, Ride>()

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function startRide() {
  const ride: Ride = {
    rideId: randomUUID(),
    joinCode: generateJoinCode(),
    queueLength: 0,
    maxQueueSize: 5
  }

  rides.set(ride.joinCode, ride)

  return ride
}

export async function joinRide(joinCode: string) {
  const ride = rides.get(joinCode)

  if (!ride) {
    throw new Error("Ride not found")
  }

  return ride
}