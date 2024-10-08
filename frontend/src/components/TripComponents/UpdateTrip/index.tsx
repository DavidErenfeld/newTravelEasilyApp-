// UpdateTrip.tsx
import { useState, useRef, useEffect } from "react";
import tripsService, { ITrips } from "../../../services/tripsService";
import { useNavigate } from "react-router-dom";
import PopUp from "../../CommentsComponent/PopUp";
import { uploadPhoto } from "../../../services/fileService";
import ImageCarousel from "../../UIComponents/ImageCarousel";
import AddImgs from "../../UIComponents/Icons/AddImage";
import "./style.css";

interface TripDay {
  dayNum: number;
  description: string;
}

interface UpdateTripProps {
  trip: ITrips;
  onClickClose: () => void;
  onClickReadMode: () => void;
}

interface ImageWithFile {
  file?: File;
  src: string;
  alt: string;
  isFromServer?: boolean;
}

const UpdateTrip = ({ trip, onClickReadMode }: UpdateTripProps) => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const navigate = useNavigate();

  const [dayEdits, setDayEdits] = useState<TripDay[]>(
    trip.tripDescription.map((description, index) => ({
      dayNum: index + 1,
      description,
    }))
  );

  const [deleteAction, setDeleteAction] = useState<"day" | "trip" | null>(null);

  const [images, setImages] = useState<ImageWithFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // אתחול התמונות עם התמונות הקיימות של הטיול
    const existingImages = (trip.tripPhotos || []).map((url) => ({
      src: url,
      alt: "Trip Photo",
      isFromServer: true,
    }));
    setImages(existingImages);
  }, [trip.tripPhotos]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (!image.isFromServer) {
          URL.revokeObjectURL(image.src);
        }
      });
    };
  }, [images]);

  // מניעת גלילה כאשר הפופ-אפ פתוח
  useEffect(() => {
    if (deleteAction) {
      document.body.classList.add("popup-open");
    } else {
      document.body.classList.remove("popup-open");
    }
  }, [deleteAction]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = files.map((file) => ({
        file,
        src: URL.createObjectURL(file),
        alt: file.name || "Trip Image",
        isFromServer: false,
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const deleteImage = (src: string) => {
    setImages((prevImages) => {
      const imageToDelete = prevImages.find((image) => image.src === src);
      if (imageToDelete && !imageToDelete.isFromServer) {
        URL.revokeObjectURL(imageToDelete.src);
      }
      return prevImages.filter((image) => image.src !== src);
    });
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updatedDays = dayEdits.map((day, index) =>
      index === currentDayIndex
        ? { ...day, description: event.target.value }
        : day
    );
    setDayEdits(updatedDays);
  };

  const goToNextDay = () => {
    if (currentDayIndex < dayEdits.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const goToPreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const addNewDay = () => {
    if (dayEdits[currentDayIndex].description.trim() === "") {
      alert("Please add content to the current day before adding a new one.");
      return;
    }

    const newDay = {
      dayNum: dayEdits.length + 1,
      description: "",
    };
    setDayEdits([...dayEdits, newDay]);
    setCurrentDayIndex(dayEdits.length);
  };

  const deleteCurrentDay = async () => {
    if (dayEdits.length > 1) {
      const filteredDays = dayEdits.filter(
        (_, index) => index !== currentDayIndex
      );
      const renumberedDays = filteredDays.map((day, index) => ({
        ...day,
        dayNum: index + 1,
      }));
      setDayEdits(renumberedDays);
      setCurrentDayIndex(Math.max(0, currentDayIndex - 1));

      try {
        const updatedTrip = {
          ...trip,
          tripDescription: renumberedDays.map((day) => day.description),
        };
        await tripsService.updateTrip(updatedTrip);
        console.log("Day deleted and trip updated successfully.");
      } catch (error) {
        console.error("Failed to update trip after deleting day:", error);
      }
    } else {
      alert("Cannot delete the last remaining day.");
    }
    setDeleteAction(null);
  };

  const deleteTrip = async () => {
    try {
      await tripsService.deleteTrip(trip._id!);
      console.log("Trip deleted successfully.");
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete trip:", error);
    }
    setDeleteAction(null);
  };

  const handleDeleteDayClick = () => {
    setDeleteAction("day");
  };

  const handleDeleteTripClick = () => {
    setDeleteAction("trip");
  };

  const handleCancelDelete = () => {
    setDeleteAction(null);
  };

  const handleUploadImage = async (imgFile: File) => {
    try {
      const uploadedUrl = await uploadPhoto(imgFile);
      console.log(`Image uploaded successfully: ${uploadedUrl}`);
      return uploadedUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
      return null;
    }
  };

  const handleUploadImages = async () => {
    const newImages = images.filter((image) => !image.isFromServer);
    const urls: string[] = [];
    for (const image of newImages) {
      if (image.file) {
        const uploadedUrl = await handleUploadImage(image.file);
        if (uploadedUrl) {
          urls.push(uploadedUrl);
        }
      }
    }
    setUploadedUrls((prevUrls) => [...prevUrls, ...urls]);
    return urls;
  };

  const handleSave = async () => {
    try {
      // העלאת תמונות חדשות
      const tripPhotos = await handleUploadImages();

      // שילוב התמונות הקיימות עם החדשות
      const updatedTripPhotos = [
        ...images
          .filter((image) => image.isFromServer)
          .map((image) => image.src),
        ...tripPhotos,
      ];

      const updatedTrip = {
        ...trip,
        tripDescription: dayEdits.map((day) => day.description),
        tripPhotos: updatedTripPhotos,
      };
      await tripsService.updateTrip(updatedTrip);
      console.log("Trip updated successfully.");
      navigate(-1); // לאחר השמירה, חוזרים לדף הקודם
    } catch (error) {
      console.error("Failed to update trip:", error);
    }
  };

  return (
    <>
      <section className="update-trip-section flex-stretch-column-gap section">
        {images.length > 0 && (
          <ImageCarousel
            images={images}
            deleteImage={deleteImage}
            showDeleteButton={true}
          />
        )}
        <div className="update-trip-container">
          <div className="update-details">
            <p className="day-name">Day {dayEdits[currentDayIndex].dayNum}</p>
            <button className="btn-l" onClick={onClickReadMode}>
              Read Mode
            </button>
          </div>
          <textarea
            className="update-trip-description"
            value={dayEdits[currentDayIndex].description}
            onChange={handleDescriptionChange}
          />
          <div
            className="add-image-icon-update-component"
            onClick={() => imageRef.current?.click()}
          >
            <AddImgs />
          </div>
          <input
            type="file"
            multiple
            ref={imageRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <button
            className="scroll-button left"
            onClick={goToPreviousDay}
            disabled={currentDayIndex === 0}
          >
            ‹
          </button>
          <button
            className="scroll-button right"
            onClick={goToNextDay}
            disabled={currentDayIndex === dayEdits.length - 1}
          >
            ›
          </button>
        </div>
        <div className="day-navigation flex-center-gap-s">
          <button className="btn-m" onClick={handleDeleteDayClick}>
            Delete Day
          </button>
          <button className="btn-m" onClick={handleDeleteTripClick}>
            Delete Trip
          </button>
          <button className="btn-m add-day-btn" onClick={addNewDay}>
            Add Day
          </button>
        </div>

        <button className="btn-l" onClick={handleSave}>
          Save
        </button>
      </section>

      {deleteAction && (
        <div className="popup-overlay">
          <PopUp
            message={
              deleteAction === "day"
                ? `Are you sure you want to delete day number ${dayEdits[currentDayIndex].dayNum}?`
                : "Are you sure you want to delete the entire trip?"
            }
            handleCancelBtn={handleCancelDelete}
            handleDeleteBtn={
              deleteAction === "day" ? deleteCurrentDay : deleteTrip
            }
          />
        </div>
      )}
    </>
  );
};

export default UpdateTrip;
