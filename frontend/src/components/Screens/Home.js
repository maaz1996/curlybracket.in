import React from "react";
import Header from "../Parts/Header";
import Footer from "../Parts/Footer";
import Banners from "../Parts/Banner";
import Posts from "../Parts/Posts";
import Loader from "../Parts/Loader";
const Home = () => {
  return (
    <>
      <Header />
      <Banners />
      <Posts />
      <Footer />
    </>
  );
};

export default Home;
