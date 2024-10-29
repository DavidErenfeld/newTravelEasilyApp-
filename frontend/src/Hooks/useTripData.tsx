// useTripData.tsx - Modifications for real-time updates
import { useState, useEffect } from "react";
import tripsService, { ITrips } from "../services/tripsService";
import io from "socket.io-client";

// חיבור קבוע ל-Socket.IO עם כתובת ה-Heroku
const socket = io("https://evening-bayou-77034-176dc93fb1e1.herokuapp.com");

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
    loadTrip();

    // Listen for specific trip updates in real-time
    socket.on("tripUpdated", (updatedTrip: ITrips) => {
      if (updatedTrip._id === tripId) {
        setTrip(updatedTrip);
      }
    });

    return () => {
      socket.off("tripUpdated");
    };
  }, [tripId]);

  return { trip, loading };
};

export default useTripData;
