import bcrypt from "bcrypt";

import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";
import validateSignUpRequest from "../../../../validators/auth/signUpValidator";

async function createNewUser(userDetails) {
  await connectToDb();

  const newUser = new userModel({
    ...userDetails,
    privateProfile: true,
  });

  try {
    const user = await newUser.save();
    return {
      errorOccurred: false,
      message: "User created successfully.",
      user: {
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
  } catch (error) {
    if (error.code === 11000) {
      const duplicateKeys = [];
      for (var key in error.keyPattern) {
        duplicateKeys.push(key);
      }
      return {
        errorOccurred: true,
        message: "Duplicate keys.",
        duplicateKeys: duplicateKeys,
      };
    }

    return {
      errorOccurred: true,
      error: error,
      message: "Something went wrong.",
    };
  }
}

export default async function handler(req, res) {
  const validationResult = await validateSignUpRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { email, password, username, name } = req.body;

  const salt = 10;
  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(salt));

  const result = await createNewUser({
    email,
    hashedPassword,
    username,
    name,
  });

  const status = result.errorOccurred
    ? result.message === "Something went wrong."
      ? 500
      : 400
    : 201;
  return res.status(status).json({
    ...result,
  });
}
