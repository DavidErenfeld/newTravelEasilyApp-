import { ITrips } from "../../../services/tripsService";
import "./style.css";

interface TripHeaderProps {
  trip: ITrips;
}

const TripHeader = ({ trip }: TripHeaderProps) => {
  return (
    <>
      <div className="tags">
        <span className="tag">{trip.typeTraveler}</span>
        <span className="tag">{trip.typeTrip}</span>
        <span className="tag">{trip.country}</span>
        <span className="tag">{trip.tripDescription.length} days</span>
      </div>
    </>
  );
};

export default TripHeader;
