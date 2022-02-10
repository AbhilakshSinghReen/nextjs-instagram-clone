import { object, string } from "yup";

import validateObject from "../schemaValidator";

const unlikeCommentReplySchema = object({
  commentId: string().required(),
  replyId: string().required(),
});

export default async function validateUnlikeCommentReplyRequest(requestBody) {
  const result = await validateObject(unlikeCommentReplySchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
