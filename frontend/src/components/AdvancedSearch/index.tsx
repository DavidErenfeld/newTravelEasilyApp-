import React, { useState, useEffect } from "react";
import "./style.css";
import axios from "axios";
import Header from "../Header";
import tripsService, { ITrips } from "../../services/tripsService";
import TripCard from "../TripComponents/TripCard";
import CloseIcon from "../UIComponents/Icons/Close";

const AdvancedSearch: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedGroupType, setSelectedGroupType] = useState<string>("");
  const [selectedTripType, setSelectedTripType] = useState<string>("");
  const [numberOfDays, setNumberOfDays] = useState<string>("");

  const [countries, setCountries] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<ITrips[]>([]); // מצב לתוצאות חיפוש
  const [isSearchSelected, setIsSearchSelected] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countryNames = response.data.map(
          (country: any) => country.name.common
        );
        setCountries(countryNames);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsSearchSelected(true);
      const queryParams: Record<string, string | number> = {};

      if (selectedCountry) queryParams.country = selectedCountry;
      if (selectedGroupType) queryParams.typeTraveler = selectedGroupType;
      if (selectedTripType) queryParams.typeTrip = selectedTripType;
      if (numberOfDays) queryParams.numOfDays = parseInt(numberOfDays);

      const results = await tripsService.searchTripsByParams(queryParams);
      setSearchResults(results);

      // איפוס השדות לאחר שליחת הנתונים
      setSelectedCountry("");
      setSelectedGroupType("");
      setSelectedTripType("");
      setNumberOfDays("");
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  // פונקציה שמחזירה את השדות למצב הראשוני אחרי לחיצה על Try Again
  const resetSearch = () => {
    setIsSearchSelected(false);
    setSelectedCountry("");
    setSelectedGroupType("");
    setSelectedTripType("");
    setNumberOfDays("");
  };

  const renderSearchResults = () => {
    return searchResults.length > 0 ? (
      searchResults.map((trip) => (
        <section className="trip-list-item" key={trip._id}>
          <TripCard trip={trip} />
        </section>
      ))
    ) : (
      <p>No trips found for the specified criteria.</p>
    );
  };

  return (
    <>
      <Header />
      <>
        {isSearchSelected ? (
          <section className="trips-section">
            {searchResults.length === 0 ? (
              <div className="no-trips-container">
                <p className="no-trips-message">No trips found.</p>
                <button className="btn-m" onClick={resetSearch}>
                  Try again
                </button>
              </div>
            ) : (
              <section className="trips-section section">
                {/* <button className="btn-m try-again" onClick={resetSearch}>
                  Try again
                </button> */}
                {renderSearchResults()}
              </section>
            )}
          </section>
        ) : (
          <div className="profile-container advanced-search-section">
            <div className="form-close-icon">
              <CloseIcon color="#fff" />
            </div>
            <div className="form-header">
              <h2 className="form-title">Advanced Search</h2>
            </div>

            {/* שדות החיפוש */}
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                list="countries"
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="form-control"
                placeholder="Start typing to search..."
              />
              <datalist id="countries">
                {countries.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="groupType">Group Type</label>
              <select
                id="groupType"
                value={selectedGroupType}
                onChange={(e) => setSelectedGroupType(e.target.value)}
                className="form-control"
              >
                <option value="">Select Group Type</option>
                <option value="romantic couple">Romantic Couple</option>
                <option value="happy family">Happy Family</option>
                <option value="friends">Friends</option>
                <option value="seniors">Seniors</option>
                <option value="single">Single</option>
                <option value="groups">Groups</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tripType">Trip Type</label>
              <select
                id="tripType"
                value={selectedTripType}
                onChange={(e) => setSelectedTripType(e.target.value)}
                className="form-control"
              >
                <option value="">Select Trip Type</option>
                <option value="attractions">Attractions</option>
                <option value="romantic">Romantic</option>
                <option value="nature">Nature</option>
                <option value="parties">Parties</option>
                <option value="food">Food</option>
                <option value="integrated">Integrated</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="days">Number of Days</label>
              <input
                type="number"
                id="days"
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(e.target.value)}
                className="form-control"
                placeholder="Enter number of days..."
                min="1"
              />
            </div>

            <button className="btn-l" onClick={handleSubmit}>
              Search
            </button>
          </div>
        )}
      </>
    </>
  );
};

export default AdvancedSearch;
