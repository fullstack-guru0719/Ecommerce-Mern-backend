import bcrypt from 'bcryptjs'
//sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
    provider: 'email',
    googleId: 'asdfafasfwerwerwer234234234'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
    provider: 'email',
    googleId: 'wrejwerjlkj214324234'
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
    provider: 'email',
    googleId: 'sdfjlsjfl34234o234'
  },
]

export default users
