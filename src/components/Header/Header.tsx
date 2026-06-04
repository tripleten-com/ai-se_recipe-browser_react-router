import { NavLink } from "react-router-dom";

import Logo from "../../assets/logo.svg";
import "./Header.css";

function Header() {
  function getNavLinkClasses({ isActive }: { isActive: boolean }) {
    return isActive
      ? "header__nav-link header__nav-link_active"
      : "header__nav-link";
  }

  return (
    <header className="header">
      <div className="header__inner">
        <img src={Logo} alt="Recipe Browser logo" className="header__logo" />
        <nav className="header__nav">
          <NavLink className={getNavLinkClasses} to="/">
            Recipes
          </NavLink>
          <NavLink className={getNavLinkClasses} to="/favorites">
            Favorites
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
