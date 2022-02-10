import { object, string } from "yup";

import validateObject from "../schemaValidator";

const unlikePostSchema = object({
  postId: string().required(),
});

export default async function validateLikePostRequest(requestBody) {
  const result = await validateObject(unlikePostSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
