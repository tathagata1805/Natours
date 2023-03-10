/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

// SCRIPT TO HANDLE SIGNUP FUNCTION
export const signup = async (name, email, password, passwordConfirm) => {
  console.log(signup);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
