import React from "react";

const Banner = () => {
  return (
    <div
      className="hero-wrap js-fullheight"
      style={{ "background-image": "url('images/bg_1.jpg')" }}
      data-stellar-background-ratio="0.5"
    >
      <div className="overlay"></div>
      <div className="container">
        <div
          className="row no-gutters slider-text js-fullheight align-items-center justify-content-start"
          data-scrollax-parent="true"
        >
          <div className="col-md-12 ftco-animate">
            <h2 className="subheading">Hello! Welcome to</h2>
            <h1 className="mb-4 mb-md-0">Readit blog</h1>
            <div className="row">
              <div className="col-md-7">
                <div className="text">
                  <p>
                    Far far away, behind the word mountains, far from the
                    countries Vokalia and Consonantia, there live the blind
                    texts. Separated they live in Bookmarksgrove right at the
                    coast of the Semantics, a large language ocean.
                  </p>
                  <div className="mouse">
                    <a href="https://github.com" className="mouse-icon">
                      <div className="mouse-wheel">
                        <span className="ion-ios-arrow-round-down"></span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
