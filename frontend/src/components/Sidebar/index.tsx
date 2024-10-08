import "./style.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CloseIcon from "../UIComponents/Icons/Close";

interface SidebarProps {
  profileImg: string;
  isOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
}

const Sidebar = ({
  profileImg,
  isOpen,
  toggleSidebar,
  handleLogout,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = () => {
    navigate("/personal-area");
  };

  // פונקציה למניעת סגירת התפריט בלחיצה בתוכו
  const sidebarClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <>
      {isOpen && (
        <div
          className="overlay"
          onClick={(event) => {
            event.stopPropagation();
            toggleSidebar();
          }}
        ></div>
      )}
      <section
        className={`sidebar-section ${isOpen ? "open" : ""}`}
        onClick={sidebarClick}
      >
        <div className="user-sidebar-container" onClick={handleProfileClick}>
          <div className="sidebar-user-name">
            <p>{localStorage.getItem("userName")}</p>
          </div>
          <img className="user-sidebar-img" src={profileImg} alt="Profile" />
        </div>

        <Link to="/profile">
          <h1 className="sidebar-item">Profile</h1>
        </Link>

        <Link to="/myTrips">
          <h1 className="sidebar-item">My trips</h1>
        </Link>

        <Link to="/searchTrip">
          <h1 className="sidebar-item">Search trip</h1>
        </Link>

        {location.pathname.includes("/searchTrip") && (
          <Link to="/searchTrip/advancedSearch">
            <h1 className="sidebar-item">Advanced search</h1>
          </Link>
        )}

        <Link to="/AddTrip">
          <h1 className="sidebar-item">Add trip</h1>
        </Link>

        <Link to="/">
          <h1 className="sidebar-item">Home</h1>
        </Link>

        <h1 className="sidebar-item" onClick={handleLogout}>
          Logout
        </h1>

        <div className="close-sidebar">
          <CloseIcon color="#000" onClose={toggleSidebar} />
        </div>
      </section>
    </>
  );
};

export default Sidebar;
