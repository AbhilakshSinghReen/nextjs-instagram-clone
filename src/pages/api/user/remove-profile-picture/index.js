import formidable from "formidable";

import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";

import {
  uploadToStorage,
  emptyStorageFolder,
} from "../../../../lib/storage/storage";

async function removeUserProfilePicture(userId) {
  await connectToDb();

  try {
    await emptyStorageFolder(`profilePictures\\${userId}`);

    await userModel.findByIdAndUpdate(userId, {
      $set: {
        profilePicture: "",
      },
    });

    return {
      errorOccurred: false,
      httpCode: 200,
      message: "Profile picture removed successfully.",
    };
  } catch (error) {
    return {
      errorOccurred: true,
      httpCode: 500,
      error: error,
      message: "Something went wrong.",
    };
  }
}

export default async function handler(req, res) {
  const user = getUser(req);
  if (!user) {
    return res.status(401).send({
      message: "Sign in to continue.",
    });
  }

  const result = await removeUserProfilePicture(user._id);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
