import { ITrips } from "../../../services/tripsService";
import "./style.css";

interface TripDescriptionProps {
  trip: ITrips;
}

const TripDescription: React.FC<TripDescriptionProps> = ({ trip }) => {
  return (
    <section className="trip-description-section ">
      {trip.tripDescription.map((description, index) => (
        <div className="trip-day-details" key={index}>
          <h2 className="trip-day-title">Day {index + 1}</h2>
          <p className="trip-day-description">{description}</p>
        </div>
      ))}
    </section>
  );
};

export default TripDescription;
