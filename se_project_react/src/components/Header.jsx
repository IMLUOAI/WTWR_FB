import "../blocks/header/header.css";
import headerLogo from "../images/logo.svg";
import ToggleSwitch from "./ToggleSwitch";
import PlaceholderAvatar from "./PlaceholderAvatar";
import { Link } from "react-router-dom";

const Header = ({ userName, onCreateModal, handleProfileClick, isAuthorized, userAvatar }) => {
  const currentDate = new Date().toLocaleString("default", {
    month: "long",
    day: "numeric",
  });
  const cityName = "Plano";
  const dateTimeString = `${currentDate}, ${cityName}`;

  return (
    <header className="header">
      <div className="header__logo">
        <div>
          <Link to="/">
            <img src={headerLogo} className="header__logo-image" alt="Logo" />
          </Link>
        </div>
        <h3 className="header__date">{dateTimeString}</h3>
      </div>

      <ToggleSwitch />
      <div className="header__avatar-bar">
        {isAuthorized ? (
          <>
        <button
          className="header__add-button"
          type="button"
          onClick={onCreateModal}
        >
          +Add clothes
        </button>
        <Link to="/profile" className="header__link">
          <h3 className="header__user-name" onClick={handleProfileClick}>
            {userName}
          </h3>
          {userAvatar ? (
          <img className="header__avatar" src={userAvatar} alt="Avatar" />
          ) : (
            <PlaceholderAvatar name={userName} />
          )}
        </Link>
        </>
        ) : (
          <nav>
          <Link to="/register" className="header__link">Sign Up</Link>
          <Link to="/login" className="header__link">Log In</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;