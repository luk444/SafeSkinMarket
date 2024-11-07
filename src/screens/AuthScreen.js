// AuthScreen.js
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

function AuthScreen({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div>
      <h1>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h1>
      {isLogin ? (
        <Login onLoginSuccess={onLoginSuccess} />
      ) : (
        <Register />
      )}
      <button onClick={toggleAuth}>
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );


export default AuthScreen;
