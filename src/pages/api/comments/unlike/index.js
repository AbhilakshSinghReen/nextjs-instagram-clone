import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import commentModel from "../../../../lib/db/models/comment";
import validateUnlikeCommentRequest from "../../../../validators/comments/unlikeCommentValidator";

async function unlikeComment(userId, commentId) {
  await connectToDb();

  try {
    const comment = await commentModel.findById(commentId).exec();

    if (!comment) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Comment does not exist.",
      };
    }

    if (!comment.likes.includes(userId)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Cannot unlike.",
      };
    }

    await commentModel
      .findByIdAndUpdate(commentId, {
        $pull: {
          likes: userId,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 201,
      message: "Comment unliked successfully.",
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

  const validationResult = await validateUnlikeCommentRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { commentId } = req.body;

  const result = await unlikeComment(user._id, commentId);

  const status = result.httpCode;
  delete result.httpCode;

  return res.status(status).json({
    ...result,
  });
}
