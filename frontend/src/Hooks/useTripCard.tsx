import { useEffect, useState } from "react";
import tripsService, { ITrips } from "../services/tripsService";
import useSocket from "./useSocket";

const useTripCard = (trip: ITrips) => {
  const [isLiked, setIsLiked] = useState(false);
  const [numOfLikes, setNumOfLikes] = useState(trip.likes?.length);
  const [numOfComments, setNumOfComments] = useState(trip.numOfComments);

  const { send } = useSocket();

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const userId = localStorage.getItem("loggedUserId");
      const savedTripLikes = localStorage.getItem(`tripLikes_${trip._id}`);

      if (savedTripLikes) {
        const { liked, likesCount } = JSON.parse(savedTripLikes);
        setIsLiked(liked);
        setNumOfLikes(likesCount);
        return;
      }

      try {
        const updatedTrip = await tripsService.getByTripId(trip._id!);
        const liked =
          updatedTrip.likes?.some((like) => like.owner === userId) || false;

        setIsLiked(liked);
        updatedTrip.likes?.length && setNumOfLikes(updatedTrip.likes.length);
        setNumOfComments(updatedTrip.numOfComments);

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

  // האזנה לאירועים דרך הסוקט עבור לייקים ותגובות
  useSocket("likeAdded", (updatedTrip) => {
    console.log("Received likeAdded event:", updatedTrip); // לוג לוודא שהאירוע מתקבל
    if (updatedTrip._id === trip._id) {
      setNumOfLikes(updatedTrip.likes?.length);
    }
  });

  useSocket("commentAdded", (updatedTrip) => {
    if (updatedTrip._id === trip._id) {
      setNumOfComments(updatedTrip.numOfComments);
    }
  });

  const toggleLike = async () => {
    try {
      await tripsService.addLike(trip._id!);
      const updatedTrip = await tripsService.getByTripId(trip._id!);
      send("addLike", updatedTrip); // שינוי לשליחת addLike במקום likeAdded
      const liked =
        updatedTrip.likes?.some(
          (like) => like.owner === localStorage.getItem("loggedUserId")
        ) || false;

      setIsLiked(liked);
      updatedTrip.likes && setNumOfLikes(updatedTrip.likes.length);

      localStorage.setItem(
        `tripLikes_${trip._id}`,
        JSON.stringify({ liked, likesCount: updatedTrip.likes?.length })
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return { isLiked, numOfLikes, numOfComments, toggleLike };
};

export default useTripCard;
