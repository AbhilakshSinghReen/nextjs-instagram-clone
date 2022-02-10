import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import commentModel from "../../../../lib/db/models/comment";
import validateCreateCommentReplyRequest from "../../../../validators/comment-replies/createCommentValidator";

async function createCommentReply(commentId, userId, replyContent) {
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

    const reply = {
      creator: userId,
      content: replyContent,
      likes: [],
    };

    await commentModel
      .findByIdAndUpdate(commentId, {
        $push: {
          replies: reply,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 201,
      message: "Comment reply created successfully.",
      reply: reply,
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

  const validationResult = await validateCreateCommentReplyRequest(req.body);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const { commentId, content } = req.body;

  const result = await createCommentReply(commentId, user._id, content);

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}
