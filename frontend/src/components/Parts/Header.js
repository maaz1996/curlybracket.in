import React from "react";

function Header() {
  return (
    <nav
      className="navbar px-md-0 navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light"
      id="ftco-navbar"
    >
      <div className="container">
        <a className="navbar-brand" href="index.html">
          Read<i>it</i>.
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#ftco-nav"
          aria-controls="ftco-nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="oi oi-menu"></span> Menu
        </button>

        <div className="collapse navbar-collapse" id="ftco-nav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item active">
              <a href="index.html" className="nav-link">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a href="blog.html" className="nav-link">
                Articles
              </a>
            </li>
            <li className="nav-item">
              <a href="about.html" className="nav-link">
                Team
              </a>
            </li>
            <li className="nav-item">
              <a href="contact.html" className="nav-link">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
export default Header;
