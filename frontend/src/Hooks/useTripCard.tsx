import { useEffect, useState } from "react";
import tripsService, { ITrips } from "../services/tripsService";

const useTripCard = (trip: ITrips) => {
  const [isLiked, setIsLiked] = useState(false);
  const [numOfLikes, setNumOfLikes] = useState(trip.numOfLikes);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const userId = localStorage.getItem("loggedUserId");

      // בדוק אם יש נתונים על הלייקים ב-localStorage
      const savedTripLikes = localStorage.getItem(`tripLikes_${trip._id}`);
      if (savedTripLikes) {
        const { liked, likesCount } = JSON.parse(savedTripLikes);
        setIsLiked(liked);
        setNumOfLikes(likesCount);
        return; // אין צורך לקרוא לשרת אם יש נתונים מקומיים
      }

      try {
        const updatedTrip = await tripsService.getByTripId(trip._id!);
        const liked =
          updatedTrip.likes?.some((like) => like.owner === userId) || false;

        setIsLiked(liked);
        setNumOfLikes(updatedTrip.numOfLikes);

        // שמור את מצב הלייקים ב-localStorage
        localStorage.setItem(
          `tripLikes_${trip._id}`,
          JSON.stringify({ liked, likesCount: updatedTrip.numOfLikes })
        );
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

      // עדכון מצב הלייקים ב-localStorage
      localStorage.setItem(
        `tripLikes_${trip._id}`,
        JSON.stringify({ liked, likesCount: updatedTrip.numOfLikes })
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return { isLiked, numOfLikes, toggleLike };
};

export default useTripCard;
