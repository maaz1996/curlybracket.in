import React from "react";
import Home from "../src/components/Screens/Home";
import { BrowserRouter, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Route path="/">
        <Home />
      </Route>
    </BrowserRouter>
  );
}

export default App;
