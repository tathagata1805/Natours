/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51KGQTvSF3gWJq8l3VF12kQstvORmZsVONI223uC4GQQFy60fAO43FbIXWaQTJ0m1DDkSUyr6PTFJMxVJc1he8COd00WR8NuDnv'
    );
    // 1) GET CHECKOUT SESSION FROM API ENDPOINT
    const session = await axios(
      `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) CREATE CHECKOUT FORM
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
