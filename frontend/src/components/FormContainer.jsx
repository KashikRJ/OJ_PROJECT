import React from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const FormContainer = ({ resetForm }) => {
  return (
    <div className="form-container">
      <div className="form-inner">
        <LoginForm resetForm={resetForm} />
        <SignupForm resetForm={resetForm} />
      </div>
    </div>
  );
};

export default FormContainer;
