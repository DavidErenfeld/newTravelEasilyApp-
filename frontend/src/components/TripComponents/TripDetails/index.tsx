import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import tripsService, { ITrips } from "../../../services/tripsService.ts";
import TripDescription from "../TripDescription/index.tsx";
import UpdateTrip from "../UpdateTrip/index.tsx";
import AddComment from "../../CommentsComponent/AddComment/index.tsx";
import ViewComment from "../../CommentsComponent/ViewComment/index.tsx";
import TripHeader from "../TripHeader/index.tsx";
import "./style.css";
import Header from "../../Header/index.tsx";
import ImageCarousel from "../../UIComponents/ImageCarousel/index.tsx";
import { deletePhotoFromCloudinary } from "../../../services/fileService.ts";
import LoadingDots from "../../UIComponents/Loader";
import io from "socket.io-client";

// חיבור Socket.IO לשרת
const socket = io("https://evening-bayou-77034-176dc93fb1e1.herokuapp.com");

interface Images {
  src: string;
  alt: string;
}

const TripDetails = () => {
  const [viewMode, setViewMode] = useState("main");
  const [updateMode, setUpdateMode] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [trip, setTrip] = useState<ITrips | null>(null);
  const [loading, setLoading] = useState(true);
  const loggedUserName = localStorage.getItem("userName") || "";
  const loggedUserId = localStorage.getItem("loggedUserId") || "";
  const isThisTheOwner = loggedUserId !== trip?.owner?._id ? false : true;

  const [mMargin, setMMargin] = useState("");

  useEffect(() => {
    if (searchParams.get("viewMode") === "viewComments") {
      setViewMode("viewComments");
    }
  }, [searchParams]);

  const loadTripFromServer = async () => {
    try {
      const data = await tripsService.getByTripId(id!);
      setTrip(data);

      const updatedTrips = [
        ...JSON.parse(localStorage.getItem("trips") || "[]"),
        data,
      ];
      localStorage.setItem("trips", JSON.stringify(updatedTrips));

      data.tripPhotos && data.tripPhotos?.length > 0
        ? setMMargin("")
        : setMMargin("m-margin");
    } catch (err) {
      console.error("Failed to load trip:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrip = () => {
    setLoading(true);

    const savedTrips = localStorage.getItem("trips");
    if (savedTrips) {
      const trips: ITrips[] = JSON.parse(savedTrips);
      const foundTrip = trips.find((t) => t._id === id);
      if (foundTrip) {
        setTrip(foundTrip);
        setMMargin(
          foundTrip.tripPhotos && foundTrip.tripPhotos.length > 0
            ? ""
            : "m-margin"
        );
      }
    }

    loadTripFromServer();
  };

  useEffect(() => {
    loadTrip();

    socket.on("commentAdded", (commentData) => {
      console.log("New comment received:", commentData);
      if (commentData.tripId === id) {
        setTrip((prevTrip) => ({
          ...prevTrip!,
          comments: [...prevTrip!.comments, commentData.newComment],
          numOfComments: prevTrip!.numOfComments + 1,
        }));
      }
    });

    socket.on("commentDeleted", (commentData) => {
      console.log("Received commentDeleted event:", commentData);
      if (commentData.tripId === id) {
        loadTripFromServer();
      }
    });

    return () => {
      socket.off("commentAdded");
      socket.off("commentDeleted");
    };
  }, [id, updateMode]);

  const onClickUpdateMode = () => {
    setUpdateMode(!updateMode);
  };

  const onClickSend = async (
    newCommentText: string,
    stayInViewMode: boolean = false
  ) => {
    setLoading(true);

    const commentToAdd = {
      comment: newCommentText || "",
      owner: loggedUserName || "",
      date: new Date().toISOString(),
      imgUrl: localStorage.getItem("imgUrl") || "",
    };

    try {
      await tripsService.addComment(trip?._id || "", commentToAdd);

      loadTripFromServer();

      if (!stayInViewMode) {
        setViewMode("main");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentDeleted = async () => {
    loadTripFromServer();
  };

  const imageObjects: Images[] =
    trip?.tripPhotos?.map((photoUrl) => ({
      src: photoUrl,
      alt: "Trip Photo",
    })) || [];

  return (
    <>
      <Header />
      {loading ? (
        <div className="trips-loader main-loader-section">
          <LoadingDots />
        </div>
      ) : (
        <>
          {trip?.tripPhotos && trip?.tripPhotos?.length > 0 && !updateMode && (
            <div className="imeges-section">
              <ImageCarousel
                images={imageObjects}
                showDeleteButton={isThisTheOwner}
              />
            </div>
          )}
          <section className="flex-center-column-large-gap section">
            {!updateMode ? (
              <div
                className={`${mMargin} main-card-section flex-center-column-large-gap`}
              >
                {trip && <TripHeader trip={trip} />}
                <section className="details-container flex-center-column">
                  {loggedUserId === trip?.owner?._id && (
                    <button
                      className="btn-l mode-btn"
                      onClick={onClickUpdateMode}
                    >
                      Editing Mode
                    </button>
                  )}
                  {trip && <TripDescription trip={trip} />}
                </section>
                {viewMode === "main" && (
                  <section className="btn-container-gap-m">
                    <button
                      className="btn-l"
                      onClick={() => setViewMode("addComment")}
                    >
                      Add Comment
                    </button>
                    <button
                      className="btn-l"
                      onClick={() => setViewMode("viewComments")}
                    >
                      View Comments
                    </button>
                  </section>
                )}
                {viewMode === "addComment" && (
                  <AddComment
                    onClickCancel={() => setViewMode("main")}
                    onSendComment={onClickSend}
                  />
                )}
                {viewMode === "viewComments" && trip && (
                  <>
                    {trip._id && (
                      <ViewComment
                        comments={trip.comments}
                        closeComments={() => setViewMode("main")}
                        tripId={trip._id}
                        onCommentDeleted={handleCommentDeleted}
                      />
                    )}
                    <AddComment
                      onClickCancel={() => setViewMode("main")}
                      onSendComment={(text) => onClickSend(text, true)}
                    />
                  </>
                )}
              </div>
            ) : (
              trip && (
                <UpdateTrip
                  onClickClose={() => setUpdateMode(false)}
                  trip={trip}
                  onClickReadMode={onClickUpdateMode}
                />
              )
            )}
          </section>
        </>
      )}
    </>
  );
};

export default TripDetails;
