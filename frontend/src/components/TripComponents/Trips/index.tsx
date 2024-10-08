import React from "react";
import TripCard from "../TripCard";
import "./style.css";
import { useTrips } from "../../../Context/TripContext";
import Header from "../../Header";

const Trips = () => {
  const { trips, refreshTrips } = useTrips();

  const renderTrips = () => {
    return trips.map((trip) => (
      <article className="trip-list-item" key={trip._id}>
        <TripCard trip={trip} />
      </article>
    ));
  };

  React.useEffect(() => {
    refreshTrips();
  }, []);

  return (
    <>
      <Header />
      <section className="trips-section section">
        {trips.length === 0 ? (
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
