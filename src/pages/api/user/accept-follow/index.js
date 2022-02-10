import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";

async function acceptFollow(currentUserId, userWhoRequestedId) {
  await connectToDb();

  try {
    const currentUser = await userModel.findById(currentUserId);

    // check if not already following
    if (currentUser.followers.includes(userWhoRequestedId)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "User is already following you.",
      };
    }

    // check if follow has been requested
    if (!currentUser.unacceptedFollowerRequests.includes(userWhoRequestedId)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "User has not requested to follow you.",
      };
    }

    await userModel
      .findByIdAndUpdate(currentUserId, {
        $pull: {
          unacceptedFollowerRequests: userWhoRequestedId,
        },
        $push: {
          followers: userWhoRequestedId,
        },
      })
      .exec();

    await userModel
      .findByIdAndUpdate(userWhoRequestedId, {
        $pull: {
          unacceptedFollowingRequests: currentUserId,
        },
        $push: {
          following: currentUserId,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 200,
      message: "Follow accepted.",
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

  const { userWhoRequested } = req.body;

  const result = await acceptFollow(user._id, userWhoRequested);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
