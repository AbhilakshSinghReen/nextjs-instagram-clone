import { object, string } from "yup";

import validateObject from "../schemaValidator";

const likeCommentSchema = object({
  commentId: string().required(),
});

export default async function validateLikeCommentRequest(requestBody) {
  const result = await validateObject(likeCommentSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
