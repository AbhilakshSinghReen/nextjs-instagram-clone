import formidable from "formidable";

import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";

import {
  uploadToStorage,
  emptyStorageFolder,
} from "../../../../lib/storage/storage";

async function updateUserProfilePicture(userId, newProfilePicture) {
  await connectToDb();

  try {
    await emptyStorageFolder(`profilePictures\\${userId}`);
    const newDpUrl = await uploadToStorage(
      `profilePictures\\${userId}`,
      newProfilePicture
    );

    await userModel.findByIdAndUpdate(userId, {
      $set: {
        profilePicture: newDpUrl,
      },
    });

    return {
      errorOccurred: false,
      httpCode: 200,
      message: "Profile picture updated successfully.",
      profilePicture: newDpUrl,
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

  const form = new formidable.IncomingForm({
    multiples: true,
    keepExtensions: true,
  });
  var formData = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });

  const files = [];
  for (var filename in formData.files) {
    files.push(formData.files[filename]);
  }

  if (files.length === 0) {
    return res.status(400).json({
      errorOccurred: true,
      message: "Profile picture not provided.",
    });
  }

  const result = await updateUserProfilePicture(user._id, files[0]);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
