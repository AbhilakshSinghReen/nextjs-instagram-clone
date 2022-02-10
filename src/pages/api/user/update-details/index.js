import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";

async function updateUserDetails(userId, changes) {
  await connectToDb();

  try {
    await userModel.findByIdAndUpdate(userId, {
      $set: changes,
    });

    return {
      errorOccurred: false,
      httpCode: 200,
      message: "User details updated successfully.",
      changes: changes,
    };
  } catch (error) {
    if (error.code === 11000) {
      const duplicateKeys = [];
      for (var key in error.keyPattern) {
        duplicateKeys.push(key);
      }
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Duplicate keys.",
        duplicateKeys: duplicateKeys,
      };
    }

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

  const changes = {};
  if (req.body.username) {
    changes.username = req.body.username;
  }
  if (req.body.name) {
    changes.name = req.body.name;
  }
  if (req.body.contactNumber) {
    changes.contactNumber = req.body.contactNumber;
  }
  if (req.body.privateProfile !== undefined) {
    changes.privateProfile = req.body.privateProfile;
  }

  const result = await updateUserDetails(user._id, changes);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
