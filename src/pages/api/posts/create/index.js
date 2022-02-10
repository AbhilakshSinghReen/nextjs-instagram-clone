import formidable from "formidable";

import getUser from "../../../../lib/auth/getUser";
import { uploadMultipleToStorage } from "../../../../lib/storage/storage";

import connectToDb from "../../../../lib/db/db";
import postModel from "../../../../lib/db/models/post";
import validatePostCreateRequest from "../../../../validators/posts/postCreateValidator";

async function createNewPost(user, postData) {
  await connectToDb();

  if (!postData.caption || postData.media.length === 0) {
    return {
      errorOccurred: true,
      message: "Caption and media must be provided.",
    };
  }

  const newPost = new postModel({
    creator: user._id,
    caption: postData.caption,
    media: [],
    likes: [],
  });

  try {
    const post = await newPost.save();

    const mediaUrls = await uploadMultipleToStorage(
      `posts/${post._id}`,
      postData.media
    );

    const mediaUrlsAndTypes = mediaUrls.map((url) => ({
      type: "image",
      url: url,
    }));

    await postModel
      .findByIdAndUpdate(post._id, {
        $set: {
          media: mediaUrlsAndTypes,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      message: "Post created successfully.",
    };
  } catch (error) {
    return {
      errorOccurred: true,
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

  const form = new formidable.IncomingForm({
    multiples: true,
    keepExtensions: true,
  });
  var formData = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });

  const validationResult = await validatePostCreateRequest(formData.fields);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const files = [];
  for (var filename in formData.files) {
    files.push(formData.files[filename]);
  }

  const postData = {
    caption: formData.fields.caption,
    media: files,
  };

  const result = await createNewPost(user, postData);

  const status = result.errorOccurred
    ? result.message === "Something went wrong."
      ? 500
      : 400
    : 201;
  return res.status(status).json({
    ...result,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
