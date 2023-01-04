/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// TYPE IS EITHER "PASSWORD" OR "DATA"
export const updateSettings = async (data, type) => {
  try {
    // SELECTING URL BASED ON THE REQUEST TO CHANGE "DATA" OR "PASSWORD"
    const url =
      type === 'password'
        ? 'http://localhost:8000/api/v1/users/updateMyPassword'
        : 'http://localhost:8000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    // SENDING ALERT BASED ON THE CHANGE OF "DATA" OR "PASSWORD"
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated Successfully`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
