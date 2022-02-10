import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import commentModel from "../../../../lib/db/models/comment";
import validateDeleteCommentReplyRequest from "../../../../validators/comment-replies/deleteCommentValidator";

async function deleteCommentReply(userId, commentId, replyId) {
  await connectToDb();

  try {
    console.log("Triggered");
    const replies = await commentModel.findOne(
      { _id: commentId },
      {
        replies: {
          $elemMatch: {
            _id: replyId,
          },
        },
      }
    );

    if (!replies || replies?.replies?.length === 0) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Reply does not exist.",
      };
    }

    const reply = replies.replies[0];

    if (!reply.creator.equals(userId)) {
      return {
        errorOccurred: true,
        httpCode: 401,
        message: "Unauthorized.",
      };
    }

    await commentModel
      .findByIdAndUpdate(commentId, {
        $pull: {
          replies: {
            _id: replyId,
          },
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 200,
      message: "Reply deleted successfully.",
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

  const validationResult = await validateDeleteCommentReplyRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { commentId, replyId } = req.body;

  const result = await deleteCommentReply(user._id, commentId, replyId);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
