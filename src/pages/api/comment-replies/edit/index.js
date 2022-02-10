import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import commentModel from "../../../../lib/db/models/comment";
import validateEditCommentReplyRequest from "../../../../validators/comment-replies/likeCommentReplyValidator";

async function editCommentReply(userId, commentId, replyId, content) {
  await connectToDb();

  try {
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
      .findOneAndUpdate(
        {
          _id: commentId,
          "replies._id": replyId,
        },
        {
          $set: {
            "replies.$.content": content,
          },
        }
      )
      .exec();

    return {
      errorOccurred: false,
      httpCode: 200,
      message: "Reply edited successfully.",
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

  const validationResult = await validateEditCommentReplyRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { commentId, replyId, content } = req.body;

  const result = await editCommentReply(user._id, commentId, replyId, content);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
