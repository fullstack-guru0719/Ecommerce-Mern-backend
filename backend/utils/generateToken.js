import jwt from 'jsonwebtoken'

/**
 * 
 * @param {string} id user id
 * It generates the token 
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export default generateToken
