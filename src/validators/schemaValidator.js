export default async function validateObject(schema, object, options) {
  try {
    const validatedObject = await schema.validate(object, options);

    return {
      isValid: true,
      validatedObject: validatedObject,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error,
    };
  }
}
