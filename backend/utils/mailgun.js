import sendEmail from '../config/mailgun.js'
import {
  resetEmail,
  confirmResetPasswordEmail,
  signupEmail,
  newsletterSubscriptionEmail,
  contactEmail,
  orderConfirmationEmail
} from '../config/template.js'

/**
 * 
 * @param {string} email the recipient email 
 * @param {string} type the type of email
 * @param {string} host host name
 * @param {string} data content of the email
 * This function is to send email to the users' mailbox
 */
const sendEmailtoUser = async (email, type, host, data) => {
  let result
  let response

  try {
    const message = prepareTemplate(type, host, data)
    response = await sendEmail(email, message)
  } catch(err) {

  }

  if(response) {
    result = response
  }

  return result
}

const prepareTemplate = (type, host, data) => {
  let message;

  switch (type) {
    case 'reset':
      message = resetEmail(host, data);
      break;

    case 'reset-confirmation':
      message = confirmResetPasswordEmail();
      break;

    case 'signup':
      message = signupEmail(data);

      break;

    case 'newsletter-subscription':
      message = newsletterSubscriptionEmail();
      break;

    case 'contact':
      message = contactEmail();
      break;

    case 'order-confirmation':
      message = orderConfirmationEmail(data);
      break;

    default:
      message = '';
  }

  return message;
};

export default sendEmailtoUser