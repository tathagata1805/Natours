/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// LOGIN FEATURE HANDLER
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged In Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

// LOGOUT FEATURE HANDLER
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/users/logout',
    });
    if ((res.data.status = 'success'))
      showAlert('success', 'Logged Out Successfully');
    window.setTimeout(() => {
      location.assign('/');
    }, 1000);
  } catch (error) {
    showAlert('error', 'Error Logging out, try again');
  }
};
