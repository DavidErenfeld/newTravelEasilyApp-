import React, { useState, useEffect } from "react";
import "./style.css";
import axios from "axios";
import CloseIcon from "../../UIComponents/Icons/Close";
import Header from "../../Header";

const Profile: React.FC = () => {
  const [selectedDateOfBirth, setSelectedDateOfBirth] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedReligion, setSelectedReligion] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedAccessibility, setSelectedAccessibility] =
    useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);

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

  const saveCountryName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCountry(event.target.value);
  };

  const saveDateOfBirth = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDateOfBirth(event.target.value);
  };

  const onClickSend = () => {
    const profileData = {
      dateOfBirth: selectedDateOfBirth,
      gender: selectedGender,
      country: selectedCountry,
      accessibility: selectedAccessibility,
      religion: selectedReligion,
      status: selectedStatus,
    };
    console.log(profileData);
  };

  return (
    <>
      <Header />
      <section className="main-section">
        <div className="profile-container">
          <div className="profile-close-icon">
            <CloseIcon color="#fff" />
          </div>
          <div className="form-header">
            <h2 className="form-title">Profile</h2>
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              value={selectedDateOfBirth}
              onChange={saveDateOfBirth}
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                list="countries"
                id="country"
                value={selectedCountry}
                onChange={saveCountryName}
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
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="form-control"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accessibility">Accessibility</label>
              <select
                id="accessibility"
                value={selectedAccessibility}
                onChange={(e) => setSelectedAccessibility(e.target.value)}
                className="form-control"
              >
                <option value="Accessible">Accessible</option>
                <option value="Not Accessible">Not Accessible</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="religion">Religion</label>
              <select
                id="religion"
                value={selectedReligion}
                onChange={(e) => setSelectedReligion(e.target.value)}
                className="form-control"
              >
                <option value="Religious">Religious</option>
                <option value="Secular">Secular</option>
                <option value="Ultra-Orthodox">Ultra-Orthodox</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-control"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Married +">Married +</option>
            </select>
          </div>

          <button className="btn-l" onClick={onClickSend}>
            SEND
          </button>
        </div>
      </section>
    </>
  );
};

export default Profile;
