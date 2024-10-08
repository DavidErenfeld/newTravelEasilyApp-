import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tripsService, { ITrips } from "../../services/tripsService";
import { uploadPhoto } from "../../services/fileService";
import Header from "../Header";
import AddImgs from "../UIComponents/Icons/AddImage";
import ImageCarousel from "../UIComponents/ImageCarousel";
import "./style.css";
import SuccessMessage from "../UIComponents/SuccessMessage";

interface TripDay {
  dayNum: number;
  description: string;
}

interface ImageWithFile {
  file: File;
  src: string;
  alt: string;
  isFromServer?: boolean;
}

const CreateTrip: React.FC = () => {
  const location = useLocation();
  const { numberOfDays, selectedGroupType, selectedTripType, selectedCountry } =
    location.state || {};

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [dayEdits, setDayEdits] = useState<TripDay[]>(
    Array.from({ length: numberOfDays }, (_, index) => ({
      dayNum: index + 1,
      description: "",
    }))
  );

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [images, setImages] = useState<ImageWithFile[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

    const updatedErrors = [...errorMessages];
    updatedErrors[currentDayIndex] = "";
    setErrorMessages(updatedErrors);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = files.map((file) => ({
        file,
        src: URL.createObjectURL(file),
        alt: file.name || "Trip Image",
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (!image.isFromServer) {
          URL.revokeObjectURL(image.src);
        }
      });
    };
  }, [images]); // הוסף את images כתלות

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
    const urls: string[] = [];
    for (const image of images) {
      const uploadedUrl = await handleUploadImage(image.file);
      if (uploadedUrl) {
        urls.push(uploadedUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
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

    const tripData = dayEdits.map((day) => day.description);

    const tripPhotos = await handleUploadImages();

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
    };

    try {
      await tripsService.postTrip(trip);
      console.log("Trip Data Submitted:", tripData);
      console.log("Additional Data:", {
        selectedGroupType,
        selectedTripType,
        selectedCountry,
      });

      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Failed to save the trip:", error);
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
      <section className="create-trip-section update-trip-section flex-stretch-column-gap section">
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
    </>
  );
};

export default CreateTrip;
