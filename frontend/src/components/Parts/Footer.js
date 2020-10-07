import React from "react";

const Footer = () => {
  return (
    <footer className="ftco-footer ftco-bg-dark ftco-section">
      <div className="container">
        <div className="row mb-5">
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="logo">
                <a href="#">
                  Read<span>it</span>.
                </a>
              </h2>
              <p>
                Far far away, behind the word mountains, far from the countries
                Vokalia and Consonantia, there live the blind texts.
              </p>
              <ul className="ftco-footer-social list-unstyled float-md-left float-lft mt-5">
                <li className="ftco-animate">
                  <a href="#">
                    <span className="icon-twitter"></span>
                  </a>
                </li>
                <li className="ftco-animate">
                  <a href="#">
                    <span className="icon-facebook"></span>
                  </a>
                </li>
                <li className="ftco-animate">
                  <a href="#">
                    <span className="icon-instagram"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">latest News</h2>
              <div className="block-21 mb-4 d-flex">
                <a
                  className="img mr-4 rounded"
                  style="background-image: url(images/image_1.jpg);"
                ></a>
                <div className="text">
                  <h3 className="heading">
                    <a href="#">
                      Even the all-powerful Pointing has no control about
                    </a>
                  </h3>
                  <div className="meta">
                    <div>
                      <a href="#">
                        <span /> Oct. 16, 2019
                      </a>
                    </div>
                    <div>
                      <a href="#">
                        <span /> Admin
                      </a>
                    </div>
                    <div>
                      <a href="#">
                        <span /> 19
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="block-21 mb-4 d-flex">
                <a
                  className="img mr-4 rounded"
                  style="background-image: url(images/image_2.jpg);"
                ></a>
                <div className="text">
                  <h3 className="heading">
                    <a href="#">
                      Even the all-powerful Pointing has no control about
                    </a>
                  </h3>
                  <div className="meta">
                    <div>
                      <a href="#">
                        <span /> Oct. 16, 2019
                      </a>
                    </div>
                    <div>
                      <a href="#">
                        <span /> Admin
                      </a>
                    </div>
                    <div>
                      <a href="#">
                        <span /> 19
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md">
            <div className="ftco-footer-widget mb-4 ml-md-5">
              <h2 className="ftco-heading-2">Information</h2>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="py-1 d-block">
                    <span className="ion-ios-arrow-forward mr-3"></span>Home
                  </a>
                </li>
                <li>
                  <a href="#" className="py-1 d-block">
                    <span className="ion-ios-arrow-forward mr-3"></span>About
                  </a>
                </li>
                <li>
                  <a href="#" className="py-1 d-block">
                    <span className="ion-ios-arrow-forward mr-3"></span>Articles
                  </a>
                </li>
                <li>
                  <a href="#" className="py-1 d-block">
                    <span className="ion-ios-arrow-forward mr-3"></span>Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">Have a Questions?</h2>
              <div className="block-23 mb-3">
                <ul>
                  <li>
                    <span className="icon icon-map-marker"></span>
                    <span className="text">
                      203 Fake St. Mountain View, San Francisco, California, USA
                    </span>
                  </li>
                  <li>
                    <a href="#">
                      <span className="icon icon-phone"></span>
                      <span className="text">+2 392 3929 210</span>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <span className="icon icon-envelope"></span>
                      <span className="text">info@yourdomain.com</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 text-center">
            <p>
              Copyright &copy;
              <script>document.write(new Date().getFullYear());</script> All
              rights reserved | This template is made with{" "}
              <i className="icon-heart color-danger" aria-hidden="true"></i> by{" "}
              <a href="https://colorlib.com" target="_blank">
                Colorlib
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
