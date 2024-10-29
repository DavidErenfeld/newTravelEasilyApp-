import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import tripsService, { ITrips } from "../services/tripsService";
import io from "socket.io-client";

// חיבור קבוע ל-Socket.IO עם כתובת ה-Heroku
const socket = io("https://evening-bayou-77034-176dc93fb1e1.herokuapp.com");

interface TripContextType {
  trips: ITrips[];
  setTrips: React.Dispatch<React.SetStateAction<ITrips[]>>;
  refreshTrips: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [trips, setTrips] = useState<ITrips[]>([]);

  // פונקציה לבדיקת תוקף הנתונים ב-localStorage
  const isDataStale = () => {
    const savedTripsTimestamp = localStorage.getItem("tripsTimestamp");
    if (!savedTripsTimestamp) return true; // אם אין תאריך, נחשב שהנתונים ישנים
    const currentTime = Date.now();
    const timeDifference = currentTime - parseInt(savedTripsTimestamp);
    const MAX_STALE_TIME = 60 * 60 * 1000; // נתחשב שהנתונים ישנים אחרי שעה
    return timeDifference > MAX_STALE_TIME;
  };

  // טוען את הטיולים דרך ה-API ומעדכן את ה-localStorage
  const refreshTrips = async () => {
    try {
      const { req } = tripsService.getAllTrips();
      const response = await req;
      setTrips(response.data);
      localStorage.setItem("trips", JSON.stringify(response.data));
      localStorage.setItem("tripsTimestamp", Date.now().toString());
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  useEffect(() => {
    // טוען נתונים מ-localStorage אם הם קיימים ותקפים
    const savedTrips = localStorage.getItem("trips");
    if (savedTrips && !isDataStale()) {
      setTrips(JSON.parse(savedTrips));
    } else {
      refreshTrips(); // טוען מהשרת אם הנתונים לא קיימים או ישנים
    }

    // חיבור לאירועי Socket.IO לשינויים בזמן אמת
    socket.on("tripUpdated", (updatedTrip: ITrips) => {
      setTrips((prevTrips) => {
        const tripExists = prevTrips.some(
          (trip) => trip._id === updatedTrip._id
        );
        const updatedTrips = tripExists
          ? prevTrips.map((trip) =>
              trip._id === updatedTrip._id ? updatedTrip : trip
            )
          : [...prevTrips, updatedTrip];
        localStorage.setItem("trips", JSON.stringify(updatedTrips)); // עדכון ב-localStorage
        return updatedTrips;
      });
    });

    socket.on("commentAdded", (commentData) => {
      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip._id === commentData.tripId
            ? { ...trip, comments: [...trip.comments, commentData] }
            : trip
        )
      );
      localStorage.setItem("trips", JSON.stringify(trips)); // שמירת עדכון ב-localStorage
    });

    return () => {
      socket.off("tripUpdated");
      socket.off("commentAdded");
    };
  }, []);

  return (
    <TripContext.Provider value={{ trips, setTrips, refreshTrips }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within a TripProvider");
  }
  return context;
};
