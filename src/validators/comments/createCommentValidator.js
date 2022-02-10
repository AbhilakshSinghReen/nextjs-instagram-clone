import { object, string } from "yup";

import validateObject from "../schemaValidator";

const createCommentSchema = object({
  postId: string().required(),
  content: string().required().max(500),
});

export default async function validateCreateCommentRequest(requestBody) {
  const result = await validateObject(createCommentSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
