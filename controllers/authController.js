const User = require("../models/user.js");
const otpGenerator = require("expiring-otp-generator");
const jwt = require("jsonwebtoken");
const { sendSms } = require("../utils/twilio.js");
const nodemailer = require("nodemailer");
const { hashPassword } = require("../utils/hashPassword.js");

const authSignUp = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phonenumber,
      // password,
      // confirmpassword,
    } = req.body;
    if (!firstname || !lastname || !email || !phonenumber)
      return res.status(400).json({
        message: "Please enter all mandatory fields",
      });
    // if (password !== confirmpassword)
    //   return res.status(401).json({
    //     message: "Passwords do not match",
    //   });
    const existingPhoneNumber = await User.findOne({ phonenumber });
    if (existingPhoneNumber) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const expiryTime = 30000000;
    const otp = otpGenerator.generateAndStoreOTP(6, phonenumber, expiryTime);
    const sendingStatus = await sendSms(phonenumber, otp);
    if (sendingStatus.status === 200) {
      res.json({
        data: {
          firstname,
          lastname,
          email,
          phonenumber,
          sendingStatus,
          mode: "signup",
        },
      });
    } else if (sendingStatus.status === 400) {
      res.status(400).json(sendingStatus);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong while signUp" });
  }
};

const authSignIn = async (req, res) => {
  try {
    const { phonenumber } = req.body;
    if (!phonenumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    const existingPhoneNumber = await User.findOne({ phonenumber });
    const strin = JSON.stringify(existingPhoneNumber);
    console.log(strin.name);

    if (existingPhoneNumber) {
      const expiryTime = 300000;
      console.log(existingPhoneNumber.firstname, existingPhoneNumber.lastname);
      const otp = otpGenerator.generateAndStoreOTP(6, phonenumber, expiryTime);
      sendSms(phonenumber, otp);
      res.json({ data: existingPhoneNumber, mode: "singin" });
    } else {
      res
        .status(400)
        .json({ message: "No account found for this number.Please Sign up" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong while signIn" });
  }
};

const authAdminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "You are not Authorized" });
    }

    const existingAdmin = await User.findOne({
      email: email,
      password: password,
    });
    // res.json(existingAdmin)
    // return
    if (existingAdmin) {
      const token = jwt.sign(
        { userId: existingAdmin._id, role: existingAdmin.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({ token: token });
    } else {
      res.status(400).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unauthorized" });
  }
};

const authVerifyOtp = async (req, res) => {
  try {
    const { firstname, lastname, email, phonenumber, code, mode } = req.body;
    if (!mode) {
      return res.status(400).json({
        message: "Please verify the mode whether signup or signin mode",
      });
    }
    if (mode === "signup") {
      if (!firstname || !lastname || !email || !phonenumber || !code) {
        return res
          .status(400)
          .json({ message: "Please enter the user details with otp code" });
      }
      const isVerified = otpGenerator.verifyOTP(code, phonenumber);
      if (isVerified) {
        try {
          // let passwordHash = await hashPassword(password);
          // console.log(passwordHash);
          const user = new User(
            {
              firstname,
              lastname,
              email,
              phonenumber,
              // password: passwordHash,
              verified: true,
            },
            { password: 0 }
          );
          user.save();
          const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );
          return res.json({ data: { userdata: user, token } });
        } catch (error) {
          if (error.code === 11000) {
            return res
              .status(400)
              .json({ message: "Already exists", value: error.keyValue });
          }
          return res.status(500).json({ message: "Something went wrong" });
        }
      } else {
        return res.status(400).json({ message: "Invalid OTP or OTP Expired" });
      }
    } else {
      if (!phonenumber || !code) {
        res
          .status(400)
          .json({ message: "Please enter the code and phoneNumber" });
      }
      const user = await User.findOne({ phonenumber });
      if (user) {
        const isVerified = otpGenerator.verifyOTP(code, phonenumber);
        if (isVerified) {
          const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );
          res.json({ data: { userdata: user, token } });
        } else {
          res.status(400).json({ message: "Invalid OTP or OTP Expired" });
        }
      } else {
        res.status(400).json({ message: "No account for this number found" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while signUp" });
  }
};

const sendEmail = async (req, res) => {
  const { email, subject, template } = req.body;
  if (!email)
    return res.status(400).json({ message: "Please enter the email to send" });
  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
  let tansport = nodemailer.createTransport(config);
  let message = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: subject || "Melody Mocktail ",
    html: template,
  };
  tansport
    .sendMail(message)
    .then((response) => {
      res.status(200).json({ message: "Mail sent" });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Invalid Email" });
    });
};

module.exports = {
  authSignUp,
  authSignIn,
  authVerifyOtp,
  sendEmail,
  authAdminSignIn,
};
