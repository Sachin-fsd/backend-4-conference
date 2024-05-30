const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { BlackListTokenModel } = require("../models/blackListToken.model");
require("dotenv").config();

const authenticator = async (req, res, next) => {
  console.log("auth start", req.url, "line 6");
  try {
    // console.log("req.cookies.token",req.cookies.token)
    const token = req.cookies.token || req.headers.authorization.split(" ")[1] || "";
    // console.log("token",token)
    const blacklistedToken = await BlackListTokenModel.findOne({ token: token });
    if (blacklistedToken) {
      return res.redirect("/login"); // Redirect to login if the token is blacklisted
    }
    jwt.verify(token, process.env.secret_key, async (err, decoded) => {
      if (err) {
        console.log("auth token started", req.url, req.route, "line 10");
        return res.status(400).send({msg:"Not Authorised",ok:false})
      } else {
        req.user = decoded.UserDetails
        req.body.UserDetails = decoded.UserDetails;
        const id = await BlackListTokenModel.findOne({ id: decoded.UserDetails.UserID })
        // console.log(token,id,decoded)
        if (id) {
          return res.redirect("/login")
        }
        // console.log(req.body,)
        console.log("auth end", req.url, "line 17");
        next();
      }
    });
  } catch (error) {
    return res.status(400).send({msg:"Not Authorised",ok:false})
  }
};

module.exports = { authenticator };
