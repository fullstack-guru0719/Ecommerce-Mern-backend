import Mailgun from 'mailgun-js'

/**
 * 
 * @param {email} recipient the email of the recipient 
 * @param {string} message message for him to get
 */
const sendEmail = (recipient, message) => {
  const mailgun = Mailgun({
    apiKey: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN
  })
  return new Promise((resolve, reject) => {
    const data = {
      from : 'Oscar E-Commerce',
      to: recipient,
      subject: message.subject,
      text: message.text
    }

    mailgun.messages().send(data, (err, body) => {
      if(err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })
}

export default sendEmail
