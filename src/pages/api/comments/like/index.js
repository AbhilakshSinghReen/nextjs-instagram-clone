import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import commentModel from "../../../../lib/db/models/comment";
import validateLikeCommentRequest from "../../../../validators/comments/likeCommentValidator";

async function likeComment(userId, commentId) {
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

    if (comment.likes.includes(userId)) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Double like attempt.",
      };
    }

    await commentModel
      .findByIdAndUpdate(commentId, {
        $push: {
          likes: userId,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 201,
      message: "Comment liked successfully.",
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

  const validationResult = await validateLikeCommentRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { commentId } = req.body;

  const result = await likeComment(user._id, commentId);

  const status = result.httpCode;
  delete result.httpCode;

  return res.status(status).json({
    ...result,
  });
}
