import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, { 
    expiresIn: "30d"
     });
  return token;
};

export default generateToken;