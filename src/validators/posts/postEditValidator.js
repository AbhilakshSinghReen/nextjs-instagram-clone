import { object, string } from "yup";

import validateObject from "../schemaValidator";

const postDeleteSchema = object({
  postId: string().required(),
});

export default async function validatePostEditRequest(requestBody) {
  const result = await validateObject(postDeleteSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
