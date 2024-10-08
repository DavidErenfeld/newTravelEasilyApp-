import React from "react";
import { FaHeart, FaRegComment } from "react-icons/fa";
import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import TripHeader from "../TripHeader";
import { useAuth } from "../../../Context/AuthContext";
import useTripCard from "../../../Hooks/useTripCard";
import { ITrips } from "../../../services/tripsService";
import TripDescription from "../TripDescription";

interface TripCardProps {
  trip: ITrips;
}

const TripCard = ({ trip }: TripCardProps) => {
  const { isLiked, numOfLikes, toggleLike } = useTripCard(trip);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const likeColor = isLiked ? "blue" : "white";

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      toggleLike();
    }
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/searchTrip/trip/${trip._id}`);
  };

  return (
    <Link to={`/searchTrip/trip/${trip._id}`} className="trip-card-link">
      <section className="trip-card">
        <div className="trip-card-profile">
          <img
            className="user-profile"
            src={trip.owner?.imgUrl || "/images/user.png"}
            alt="Profile"
          />
          <p className="profile-name">{trip.userName}</p>
        </div>
        {trip && <TripHeader trip={trip} />}
        <div className="trip-description">
          <TripDescription trip={trip} />
        </div>
        <div className="icons">
          <div className="icons-area">
            <span>{numOfLikes}</span>
            <FaHeart
              onClick={handleLikeClick}
              className={`like-icon ${likeColor}`}
            />
          </div>
          <div className="icons-area" onClick={handleCommentsClick}>
            <span>{trip.numOfComments}</span>
            <FaRegComment />
          </div>
        </div>
      </section>
    </Link>
  );
};

export default TripCard;
