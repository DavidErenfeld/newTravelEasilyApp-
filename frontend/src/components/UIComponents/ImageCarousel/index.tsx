import { useRef, useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import "./style.css";
import PopUp from "../../CommentsComponent/PopUp";
import LoadingDots from "../../UIComponents/Loader"; // ייבוא רכיב הטעינה
import { EMPTY_PATH } from "zod";

export interface Images {
  src: string;
  alt: string;
  isFromServer?: boolean;
}

interface ImageCarouselProps {
  images: Images[];
  deleteImage?: (image: Images) => void;
  showDeleteButton?: boolean;
}

const ImageCarousel = ({
  images,
  deleteImage,
  showDeleteButton,
}: ImageCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [imageToDelete, setImageToDelete] = useState<Images>();
  const [loading, setLoading] = useState(true); // מצב טעינה

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // שימוש ב-useEffect לניהול מצב טעינה של התמונות
  useEffect(() => {
    const loadImages = async () => {
      const imageLoadPromises = images.map(
        (image) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = image.src;
            img.onload = () => resolve();
          })
      );
      await Promise.all(imageLoadPromises);
      setLoading(false); // שינוי מצב טעינה לאחר שהתמונות נטענו
    };

    loadImages();
  }, [images]);

  const emptyImage = {
    src: "",
    alt: "",
    isFromServer: false,
  };
  return (
    <>
      {loading ? ( // הצגת רכיב טעינה בזמן שהקומפוננטה בטעינה
        <div className="loading-container">
          <LoadingDots />
        </div>
      ) : (
        <div className="carousel-container">
          <div className="carousel" ref={carouselRef}>
            {images.map((image) => (
              <div
                className="img-container"
                key={image.src}
                onClick={() => console.log(image)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="carousel-image"
                />
                {showDeleteButton && deleteImage && (
                  <MdDelete
                    onClick={() => {
                      deleteImage(image);
                    }}
                    className="delete-icon"
                  />
                )}
              </div>
            ))}
          </div>
          <button className="scroll-button left" onClick={() => scroll("left")}>
            ‹
          </button>
          <button
            className="scroll-button right"
            onClick={() => scroll("right")}
          >
            ›
          </button>
        </div>
      )}

      {imageToDelete?.src === "" && (
        <div className="popup-overlay">
          <PopUp
            message="Are you sure you want to delete this image?"
            handleDeleteBtn={() => {
              if (deleteImage) {
                deleteImage(imageToDelete);
              }
              setImageToDelete(emptyImage);
            }}
            handleCancelBtn={() => setImageToDelete(emptyImage)}
          />
        </div>
      )}
    </>
  );
};

export default ImageCarousel;
