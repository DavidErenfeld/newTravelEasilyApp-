import React from "react";
import "./style.css";

const SkeletonTripCard = () => {
  return (
    <div className="skeleton-trip-card">
      <div className="skeleton-img"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-icons"></div>
    </div>
  );
};

export default SkeletonTripCard;
