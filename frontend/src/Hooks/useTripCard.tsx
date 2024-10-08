import { useState, useEffect } from "react";
import tripsService, { ITrips } from "../services/tripsService";

const useTripCard = (trip: ITrips) => {
  const [isLiked, setIsLiked] = useState(false);
  const [numOfLikes, setNumOfLikes] = useState(trip.numOfLikes);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const updatedTrip = await tripsService.getByTripId(trip._id!);
        const userId = localStorage.getItem("loggedUserId");
        const liked =
          updatedTrip.likes?.some((like) => like.owner === userId) || false;
        setIsLiked(liked);
        setNumOfLikes(updatedTrip.numOfLikes);
      } catch (error) {
        console.error("Failed to fetch like status:", error);
      }
    };

    fetchLikeStatus();
  }, [trip]);

  const toggleLike = async () => {
    try {
      const updatedTrip = await tripsService.addLike(trip._id!);
      const liked =
        updatedTrip.likes?.some(
          (like) => like.owner === localStorage.getItem("loggedUserId")
        ) || false;
      setIsLiked(liked);
      setNumOfLikes(updatedTrip.numOfLikes);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return { isLiked, numOfLikes, toggleLike };
};

export default useTripCard;
