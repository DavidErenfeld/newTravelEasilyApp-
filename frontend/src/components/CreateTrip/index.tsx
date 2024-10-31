import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tripsService, { ITrips } from "../../services/tripsService";
import Header from "../Header";
import AddImgs from "../UIComponents/Icons/AddImage";
import ImageCarousel from "../UIComponents/ImageCarousel";
import LoadingDots from "../UIComponents/Loader";
import SuccessMessage from "../UIComponents/SuccessMessage";
import useSocket from "../../Hooks/useSocket";
import useImageUpload from "../../Hooks/useImageUpload";
import "./style.css";

interface TripDay {
  dayNum: number;
  description: string;
}

const CreateTrip: React.FC = () => {
  const location = useLocation();
  const { numberOfDays, selectedGroupType, selectedTripType, selectedCountry } =
    location.state || {};

  // State variables
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [dayEdits, setDayEdits] = useState<TripDay[]>(
    Array.from({ length: numberOfDays }, (_, index) => ({
      dayNum: index + 1,
      description: "",
    }))
  );

  const {
    images,
    handleImageChange,
    deleteImage,
    uploadImages,
    openImageSelector,
  } = useImageUpload([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Refs and Navigation
  const imageRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // useSocket Hook for sending new trip event
  const { send } = useSocket();

  // Function to handle description change for each day
  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updatedDays = dayEdits.map((day, index) =>
      index === currentDayIndex
        ? { ...day, description: event.target.value }
        : day
    );
    setDayEdits(updatedDays);

    // Clear error for the current day if there's an input
    const updatedErrors = [...errorMessages];
    updatedErrors[currentDayIndex] = "";
    setErrorMessages(updatedErrors);
  };

  // Handle trip submission
  const handleSubmit = async () => {
    // Validate each day's description
    const errors: string[] = [];
    dayEdits.forEach((day, index) => {
      if (!day.description.trim()) {
        errors[
          index
        ] = `Day ${day.dayNum} is empty. Please fill in the description.`;
      }
    });

    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }

    setIsSubmitting(true);

    // Prepare trip data
    const tripData = dayEdits.map((day) => day.description);
    const tripPhotos = await uploadImages();

    const trip: ITrips = {
      userName: localStorage.getItem("userName") || undefined,
      typeTraveler: selectedGroupType,
      country: selectedCountry,
      typeTrip: selectedTripType,
      numOfDays: numberOfDays,
      tripDescription: tripData,
      numOfComments: 0,
      numOfLikes: 0,
      tripPhotos,
      comments: [],
    };

    try {
      const savedTrip = await tripsService.postTrip(trip);
      send("newTrip", savedTrip); // Sending new trip event to server
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Failed to save the trip:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      {showSuccessMessage && (
        <SuccessMessage
          message="Trip saved successfully!"
          onAnimationEnd={() => {
            setShowSuccessMessage(false);
            navigate("/");
          }}
        />
      )}
      <section
        className={`create-trip-section update-trip-section flex-stretch-column-gap section ${
          isSubmitting ? "blurred-background" : ""
        }`}
      >
        <div className="update-trip-container">
          <div className="update-details">
            <p className="day-name">Day {dayEdits[currentDayIndex].dayNum}</p>
          </div>
          <textarea
            className="update-trip-description"
            value={dayEdits[currentDayIndex].description}
            onChange={handleDescriptionChange}
            placeholder={`Share with us what you did on day ${dayEdits[currentDayIndex].dayNum}`}
          />
          {errorMessages[currentDayIndex] && (
            <p className="error-message">{errorMessages[currentDayIndex]}</p>
          )}

          <div
            className="add-image-icon"
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
            onClick={() => setCurrentDayIndex(currentDayIndex - 1)}
            disabled={currentDayIndex === 0}
          >
            ‹
          </button>
          <button
            className="scroll-button right"
            onClick={() => setCurrentDayIndex(currentDayIndex + 1)}
            disabled={currentDayIndex === dayEdits.length - 1}
          >
            ›
          </button>
        </div>

        {currentDayIndex === dayEdits.length - 1 && (
          <button className="btn-l submit-trip-btn" onClick={handleSubmit}>
            Submit
          </button>
        )}

        {images.length > 0 && (
          <ImageCarousel
            deleteImage={deleteImage}
            images={images}
            showDeleteButton={true}
          />
        )}
      </section>

      {isSubmitting && (
        <div className="loading-overlay">
          <LoadingDots />
        </div>
      )}
    </>
  );
};

export default CreateTrip;
