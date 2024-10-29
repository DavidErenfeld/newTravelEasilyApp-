import { useRef, useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import "./style.css";
import PopUp from "../../CommentsComponent/PopUp";
import LoadingDots from "../../UIComponents/Loader"; // ייבוא רכיב הטעינה

interface Images {
  src: string;
  alt: string;
  isFromServer?: boolean;
}

interface ImageCarouselProps {
  images: Images[];
  deleteImage?: (src: string) => void;
  showDeleteButton?: boolean;
}

const ImageCarousel = ({
  images,
  deleteImage,
  showDeleteButton,
}: ImageCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
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
              <div className="img-container" key={image.src}>
                <img
                  src={image.src}
                  alt={image.alt}
                  className="carousel-image"
                />
                {showDeleteButton && deleteImage && (
                  <MdDelete
                    onClick={() => setImageToDelete(image.src)}
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

      {imageToDelete && (
        <div className="popup-overlay">
          <PopUp
            message="Are you sure you want to delete this image?"
            handleDeleteBtn={() => {
              if (deleteImage) {
                deleteImage(imageToDelete);
              }
              setImageToDelete(null);
            }}
            handleCancelBtn={() => setImageToDelete(null)}
          />
        </div>
      )}
    </>
  );
};

export default ImageCarousel;
