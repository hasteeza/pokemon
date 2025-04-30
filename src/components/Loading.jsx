import React from "react";

import "./Loading.css";

const Loading = () => {
  return (
    <div className="loading-container">
      <img
        src="/pokeball.png"
        alt="Loading Pokeball"
        className="pokeball-bounce"
      />
    </div>
  );
};

export default Loading;
