import React from 'react';

const SlideControls = ({ handleSlideChange }) => {
  return (
    <div className="slide-controls">
      <input type="radio" name="slide" id="login" defaultChecked onChange={handleSlideChange} />
      <input type="radio" name="slide" id="signup" onChange={handleSlideChange} />
      <label htmlFor="login" className="slide login">Login</label>
      <label htmlFor="signup" className="slide signup">Signup</label>
      <div className="slider-tab"></div>
    </div>
  );
};

export default SlideControls;
