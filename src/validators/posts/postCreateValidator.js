import { object, string } from "yup";

import validateObject from "../schemaValidator";

const postDeleteSchema = object({
  caption: string().required(),
});

export default async function validatePostCreateRequest(requestBody) {
  const result = await validateObject(postDeleteSchema, requestBody, {
    abortEarly: false,
  });
  return result;
}
