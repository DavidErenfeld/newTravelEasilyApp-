import { useRef, useState } from "react";
import { MdDelete } from "react-icons/md";
import "./style.css";
import PopUp from "../../CommentsComponent/PopUp";

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

  return (
    <>
      <div className="carousel-container">
        <div className="carousel" ref={carouselRef}>
          {images.map((image) => (
            <div className="img-container" key={image.src}>
              <img src={image.src} alt={image.alt} className="carousel-image" />
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
        <button className="scroll-button right" onClick={() => scroll("right")}>
          ›
        </button>
      </div>

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
