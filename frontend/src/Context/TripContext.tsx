import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import tripsService, { ITrips } from "../services/tripsService";

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

  const isDataStale = () => {
    const savedTripsTimestamp = localStorage.getItem("tripsTimestamp");
    if (!savedTripsTimestamp) return true; // אם אין תאריך, נחשב שהנתונים ישנים
    const currentTime = Date.now();
    const timeDifference = currentTime - parseInt(savedTripsTimestamp);

    const MAX_STALE_TIME = 60 * 60 * 1000; // לדוגמה, נתחשב שהנתונים ישנים אחרי שעה
    return timeDifference > MAX_STALE_TIME;
  };

  const refreshTrips = async () => {
    try {
      const { req } = tripsService.getAllTrips();
      const response = await req;
      setTrips(response.data);
      localStorage.setItem("trips", JSON.stringify(response.data)); // שמירת הטיולים ב-localStorage
      localStorage.setItem("tripsTimestamp", Date.now().toString()); // שמירת חותמת זמן
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  useEffect(() => {
    const savedTrips = localStorage.getItem("trips");
    if (savedTrips && !isDataStale()) {
      setTrips(JSON.parse(savedTrips)); // שליפת הטיולים מ-localStorage אם הם קיימים ולא ישנים
    } else {
      refreshTrips(); // קריאה לשרת אם הנתונים לא קיימים או ישנים
    }
  }, []);

  return (
    <TripContext.Provider value={{ trips, setTrips, refreshTrips }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrips must be used within a TripProvider");
  }
  return context;
};
