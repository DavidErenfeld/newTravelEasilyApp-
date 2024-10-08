import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import "./style.css";

interface RatingProps {
  totalStars?: number;
}

const Rating: React.FC<RatingProps> = ({ totalStars = 5 }) => {
  const [selectedStars, setSelectedStars] = useState<number>(0);

  return (
    <div>
      {[...Array(totalStars)].map((n, i) => (
        <FaStar
          key={i}
          className="rating-star"
          color={i < selectedStars ? "orange" : "grey"}
          onClick={() => setSelectedStars(i + 1)}
        />
      ))}
      <p className="reting-text">
        {selectedStars} from {totalStars}
      </p>
    </div>
  );
};

export default Rating;
