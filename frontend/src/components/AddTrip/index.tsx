import React, { useState, useEffect } from "react";
import "./style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import CloseIcon from "../UIComponents/Icons/Close";

const TripForm: React.FC = () => {
  const [selectedGroupType, setSelectedGroupType] = useState<string>("");
  const [selectedTripType, setSelectedTripType] = useState<string>("");
  const [numberOfDays, setNumberOfDays] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

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

  const handleCountryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCountry(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, selectedCountry: "" }));
  };

  const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumberOfDays(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, numberOfDays: "" }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    if (!selectedGroupType) {
      newErrors.selectedGroupType = "Please select a group type.";
      valid = false;
    }
    if (!selectedTripType) {
      newErrors.selectedTripType = "Please select a trip type.";
      valid = false;
    }
    if (!numberOfDays) {
      newErrors.numberOfDays = "Please enter the number of days.";
      valid = false;
    }
    if (!selectedCountry) {
      newErrors.selectedCountry = "Please select a country.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const goToCreateTripPage = () => {
    if (validateForm()) {
      navigate("/create-trip", {
        state: {
          selectedGroupType,
          selectedTripType,
          numberOfDays: parseInt(numberOfDays, 10),
          selectedCountry,
        },
      });
    }
  };

  return (
    <>
      <Header />
      <section className="main-section ">
        <div className="profile-container">
          <div className="form-close-icon">
            <CloseIcon color="#fff" />
          </div>
          <div className="form-header">
            <h2 className="form-title">Trip Details</h2>
          </div>

          <div className="form-group">
            <label htmlFor="groupType">We are</label>
            <select
              id="groupType"
              value={selectedGroupType}
              onChange={(e) => {
                setSelectedGroupType(e.target.value);
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  selectedGroupType: "",
                }));
              }}
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
            {errors.selectedGroupType && (
              <p className="error-message">{errors.selectedGroupType}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tripType">Trip Type</label>
            <select
              id="tripType"
              value={selectedTripType}
              onChange={(e) => {
                setSelectedTripType(e.target.value);
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  selectedTripType: "",
                }));
              }}
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
            {errors.selectedTripType && (
              <p className="error-message">{errors.selectedTripType}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="days">Number of Days</label>
            <input
              type="number"
              id="days"
              value={numberOfDays}
              onChange={handleDaysChange}
              className="form-control"
              placeholder="Enter number of days..."
              min="1"
            />
            {errors.numberOfDays && (
              <p className="error-message">{errors.numberOfDays}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              list="countries"
              id="country"
              value={selectedCountry}
              onChange={handleCountryChange}
              className="form-control"
              placeholder="Start typing to search..."
            />
            <datalist id="countries">
              {countries.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
            {errors.selectedCountry && (
              <p className="error-message">{errors.selectedCountry}</p>
            )}
          </div>

          <button className="btn-l" onClick={goToCreateTripPage}>
            Next
          </button>
        </div>
      </section>
    </>
  );
};

export default TripForm;
