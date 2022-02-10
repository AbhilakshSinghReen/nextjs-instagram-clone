import { object, string } from "yup";

import validateObject from "../schemaValidator";

const deleteCommentReplySchema = object({
  commentId: string().required(),
  replyId: string().required(),
});

export default async function validateDeleteCommentReplyRequest(requestBody) {
  const result = await validateObject(deleteCommentReplySchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
