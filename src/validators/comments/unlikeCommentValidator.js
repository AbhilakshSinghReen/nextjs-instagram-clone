import { object, string } from "yup";

import validateObject from "../schemaValidator";

const unlikeCommentSchema = object({
  commentId: string().required(),
});

export default async function validateUnlikeCommentRequest(requestBody) {
  const result = await validateObject(unlikeCommentSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
