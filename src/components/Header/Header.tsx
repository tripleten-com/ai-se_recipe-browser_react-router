import Logo from "../../assets/logo.svg";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <img src={Logo} alt="Recipe Browser logo" className="header__logo" />
      </div>
    </header>
  );
}

export default Header;
