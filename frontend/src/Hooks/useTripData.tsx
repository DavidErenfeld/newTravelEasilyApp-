// useTripData.ts
import { useState, useEffect } from "react";
import tripsService, { ITrips } from "../services/tripsService";

const useTripData = (tripId: string) => {
  const [trip, setTrip] = useState<ITrips | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTrip = async () => {
    setLoading(true);
    try {
      const data = await tripsService.getByTripId(tripId);
      setTrip(data);
    } catch (error) {
      console.error("Failed to load trip:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  const updateTrip = async (updatedTrip: ITrips) => {
    try {
      await tripsService.updateTrip(updatedTrip);
      setTrip(updatedTrip);
    } catch (error) {
      console.error("Failed to update trip:", error);
    }
  };

  const deleteTrip = async () => {
    if (trip) {
      try {
        await tripsService.deleteTrip(trip._id!);
        setTrip(null);
      } catch (error) {
        console.error("Failed to delete trip:", error);
      }
    }
  };

  return {
    trip,
    loading,
    loadTrip,
    updateTrip,
    deleteTrip,
  };
};

export default useTripData;
