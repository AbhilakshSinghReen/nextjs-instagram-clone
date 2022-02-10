import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import userModel from "../../../../lib/db/models/user";

async function followUser(userId, userToFollowId) {
  await connectToDb();

  try {
    // checking for funny business
    if (userId.toString() === userToFollowId.toString()) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "You can't follow yourself.",
      };
    }

    const userToFollow = await userModel.findById(userToFollowId);

    // Check if already following
    if (userToFollow.followers.includes(userId)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Already following.",
      };
    }
    // Check if follow already requested
    if (userToFollow.unacceptedFollowerRequests.includes(userId)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Follow already requested.",
      };
    }

    if (userToFollow.privateProfile === true) {
      // ADD TO unacceptedFollowerRequests to targetUser
      await userModel
        .findByIdAndUpdate(userToFollowId, {
          $push: {
            unacceptedFollowerRequests: userId,
          },
        })
        .exec();

      // ADD TO unacceptedFollowingRequests of loggedInUser
      await userModel
        .findByIdAndUpdate(userId, {
          $push: {
            unacceptedFollowingRequests: userToFollowId,
          },
        })
        .exec();

      return {
        errorOccurred: false,
        httpCode: 200,
        message: "Follow requested.",
      };
    } else {
      // ADD TO followers to targetUser
      await userModel
        .findByIdAndUpdate(userToFollowId, {
          $push: {
            followers: userId,
          },
        })
        .exec();

      // ADD TO following of loggedInUser
      await userModel
        .findByIdAndUpdate(userId, {
          $push: {
            following: userToFollowId,
          },
        })
        .exec();

      return {
        errorOccurred: false,
        httpCode: 200,
        message: "Started following.",
      };
    }
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

  const { userToFollow } = req.body;

  const result = await followUser(user._id, userToFollow);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
