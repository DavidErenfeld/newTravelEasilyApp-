// Header.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useEffect, useState } from "react";
import "./style.css";
import Sidebar from "../Sidebar";

const Header = () => {
  const { logout } = useAuth();
  const [profileImg, setProfileImg] = useState(
    localStorage.getItem("imgUrl") || "/images/user.png"
  );
  const [isUserConect, setIsUserConect] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // state לניהול מצב התפריט
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // משנה את מצב התפריט
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProfileImg("/images/user.png");
      setIsSidebarOpen(false); // סוגר את התפריט לאחר התנתקות
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setProfileImg(localStorage.getItem("imgUrl") || "/images/user.png");
    };

    window.addEventListener("storage", handleStorageChange);

    if (localStorage.getItem("loggedUserId")) setIsUserConect(true);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      <header className="main-page-header">
        <Sidebar
          profileImg={profileImg}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        <Link to="/">
          <h1 className="logo">TRAVEL easily</h1>
        </Link>
        {!isSidebarOpen && (
          <div className="menu">
            {localStorage.getItem("loggedUserId") ? (
              <div className="menu ">
                <Link to="/">
                  <h1 className="menu-item connectet-menu">Home</h1>
                </Link>
                <Link to="/myTrips">
                  <h1 className="menu-item connectet-menu">My trips</h1>
                </Link>
                {location.pathname.includes("/AddTrip") && (
                  <Link to="/searchTrip">
                    <h1 className="menu-item connectet-menu">Search trip</h1>
                  </Link>
                )}
                {location.pathname.includes("/searchTrip") && (
                  <Link to="/searchTrip/advancedSearch">
                    <h1 className="menu-item search-item connectet-menu">
                      Advanced search
                    </h1>
                  </Link>
                )}

                <img
                  className="user-main-page-img"
                  src={profileImg}
                  alt="Profile"
                  onClick={toggleSidebar}
                />
              </div>
            ) : (
              <div className="menu">
                {/* <Link to="/">
                  <h1 className="menu-item">Home</h1>
                </Link> */}

                <Link to="/login">
                  <h1 className="menu-item">Sign in</h1>
                </Link>

                {/* <Link to="/register">
                  <h1 className="menu-item">Register</h1>
                </Link> */}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
