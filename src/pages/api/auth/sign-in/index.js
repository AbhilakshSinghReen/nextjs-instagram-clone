import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";
import validateSignInRequest from "../../../../validators/auth/signInValidator";

const isEmail = (str) => {
  return str.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

async function validateUserCredentials(userCredentials) {
  await connectToDb();

  let user = null;
  try {
    if (userCredentials.email) {
      user = await userModel.findOne({
        email: userCredentials.email,
      });
    } else if (userCredentials.username) {
      user = await userModel.findOne({
        username: userCredentials.username,
      });
    }

    if (user) {
      // User exists
      if (bcrypt.compareSync(userCredentials.password, user.hashedPassword)) {
        // Valid password
        return {
          errorOccurred: false,
          message: "Valid credentials. All ok.",
          validated: true,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            privateProfile: user.privateProfile,
            followers: user.followers,
            following: user.following,
            unacceptedFollowerRequests: user.unacceptedFollowerRequests,
            profilePicture: "",
          },
        };
      } else {
        // Invalid password
        return {
          errorOccurred: true,
          message: "Invalid credentials.",
          validated: false,
        };
      }
    } else {
      // Invalid password
      return {
        errorOccurred: true,
        message: "Invalid credentials.",
        validated: false,
      };
    }
  } catch (error) {
    // Error
    return {
      errorOccurred: true,
      error: error,
      message: "Something went wrong.",
    };
  }
}

export default async function handler(req, res) {
  const validationResult = await validateSignInRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { emailOrUsername, password } = req.body;

  const credentials = {
    password: password,
  };
  if (isEmail(emailOrUsername)) {
    credentials.email = emailOrUsername;
  } else {
    credentials.username = emailOrUsername;
  }
  const result = await validateUserCredentials(credentials);

  const status = result.errorOccurred
    ? result.message === "Something went wrong."
      ? 500
      : 400
    : 200;

  if (result.validated) {
    console.log(result.user);
    const { _id, email, username } = result.user;

    const token = jwt.sign(
      {
        _id: _id,
        email: email,
        username: username,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }
    );

    return res.status(status).json({
      token: token,
      tokenValidity: process.env.JWT_EXPIRATION_TIME,
      user: result.user,
    });
  }

  return res.status(status).json({
    ...result,
  });
}
