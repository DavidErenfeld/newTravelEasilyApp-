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
import LoadingDots from "../../UIComponents/Loader"; // ייבוא רכיב ה-LoadingDots
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
  const [loading, setLoading] = useState(true); // ניהול מצב טעינה
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

      // עדכון localStorage עם המידע המעודכן מהשרת
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

    // נסה לטעון מה-localStorage
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

    // בכל מקרה נבצע גם קריאה לשרת כדי לוודא שהמידע מעודכן
    loadTripFromServer();
  };

  useEffect(() => {
    loadTrip();

    socket.on("commentAdded", (commentData) => {
      console.log("New comment received:", commentData); // בדיקה במבנה
      if (commentData.tripId === id) {
        setTrip((prevTrip) => ({
          ...prevTrip!,
          comments: [
            ...prevTrip!.comments,
            commentData.newComment, // וודא ששדה זה קיים ומכיל את המבנה הנכון
          ],
          numOfComments: prevTrip!.numOfComments + 1,
        }));
      }
    });

    socket.on("commentDeleted", (commentData) => {
      console.log("Received commentDeleted event:", commentData);
      if (commentData.tripId === id) {
        loadTripFromServer(); // רענון המידע לאחר מחיקה
      }
    });

    return () => {
      socket.off("commentAdded");
      socket.off("commentDeleted");
    };
  }, [id]);

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
      // לאחר הוספת תגובה, טען מחדש את הטיול מהשרת
      loadTripFromServer();

      if (!stayInViewMode) {
        setViewMode("main");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setLoading(false); // סיום מצב טעינה
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

  const deleteImage = async (src: string) => {
    if (trip) {
      if (loggedUserId !== trip?.owner?._id) {
        alert("You are not authorized to delete this image.");
        return;
      }

      try {
        await deletePhotoFromCloudinary(src);

        // עדכון מערך התמונות בטיול לאחר המחיקה
        const updatedTripPhotos = trip.tripPhotos?.filter(
          (photoUrl) => photoUrl !== src
        );

        const updatedTrip = {
          ...trip,
          tripPhotos: updatedTripPhotos,
        };

        // עדכון הטיול במסד הנתונים לאחר המחיקה
        await tripsService.updateTrip(updatedTrip);
        setTrip(updatedTrip);

        // עדכון localStorage לאחר מחיקת התמונה
        const savedTrips = JSON.parse(localStorage.getItem("trips") || "[]");
        const updatedTrips = savedTrips.map((t: ITrips) =>
          t._id === updatedTrip._id ? updatedTrip : t
        );
        localStorage.setItem("trips", JSON.stringify(updatedTrips));

        console.log("Image deleted and trip updated successfully.");
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
  };

  return (
    <>
      <Header />
      {loading ? ( // אם במצב טעינה, הצג את רכיב הטעינה
        <div className="trips-loader main-loader-section">
          <LoadingDots />
        </div>
      ) : (
        <>
          {trip?.tripPhotos && trip?.tripPhotos?.length > 0 && !updateMode && (
            <div className="imeges-section">
              <ImageCarousel
                images={imageObjects}
                deleteImage={deleteImage}
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
