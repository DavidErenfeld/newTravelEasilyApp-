import React, { useState, useEffect } from "react";
import TripCard from "../TripCard";
import "./style.css";
import { useTrips } from "../../../Context/TripContext";
import Header from "../../Header";
import LoadingDots from "../../UIComponents/Loader";

const Trips = () => {
  const { trips, refreshTrips } = useTrips();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ניהול שגיאות

  const renderTrips = () => {
    return trips.map((trip) => (
      <article className="trip-list-item" key={trip._id}>
        <TripCard trip={trip} />
      </article>
    ));
  };

  useEffect(() => {
    const loadTrips = async () => {
      setIsLoading(true);
      setError(null); // איפוס שגיאה לפני טעינה
      try {
        await refreshTrips(); // קריאה לפונקציה שמביאה את המידע
      } catch (err) {
        setError("Failed to load trips. Please try again later."); // הגדרת שגיאה במידה ונכשל
        console.error("Error loading trips:", err);
      } finally {
        setIsLoading(false); // תמיד נעדכן את הסטייט לסיום טעינה
      }
    };

    loadTrips();
  }, []);

  return (
    <>
      <Header />
      <section className="trips-section section">
        {isLoading ? (
          <div className="trips-loader main-loader-section">
            <LoadingDots />
          </div>
        ) : error ? (
          <div className="main-loader-section">
            <h1>{error}</h1> {/* הצגת הודעת שגיאה למשתמש */}
          </div>
        ) : trips.length === 0 ? (
          <div className="main-loader-section">
            <h1>No trips have been added to the system yet</h1>
          </div>
        ) : (
          renderTrips()
        )}
      </section>
    </>
  );
};

export default Trips;
