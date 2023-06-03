import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from "react-router-dom";



export const AuthGuard = ({ children }) => {
    const account = useSelector((state) => state.auth);

    const { isLoggedin } = account;
    if (!isLoggedin) {
      // user is not authenticated
      return <Navigate to={"/login"} replace={true} />
    }
    return children;
  };
export default AuthGuard;
