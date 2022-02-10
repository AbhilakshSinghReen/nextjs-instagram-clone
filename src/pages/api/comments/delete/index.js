import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import commentModel from "../../../../lib/db/models/comment";
import validateDeleteCommentRequest from "../../../../validators/comments/deleteCommentValidator";

async function deleteComment(user, commentId) {
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

    if (!comment.creator.equals(user._id)) {
      return {
        errorOccurred: true,
        httpCode: 401,
        message: "Unauthorized.",
      };
    }

    await commentModel.findByIdAndDelete(commentId).exec();
    return {
      errorOccurred: false,
      httpCode: 200,
      message: "Comment deleted successfully.",
    };
  } catch (error) {
    console.log(error);
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

  const validationResult = await validateDeleteCommentRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { commentId } = req.body;

  const result = await deleteComment(user, commentId);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
