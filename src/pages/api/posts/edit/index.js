import formidable from "formidable";

import getUser from "../../../../lib/auth/getUser";
import connectToDb from "../../../../lib/db/db";
import postModel from "../../../../lib/db/models/post";

import validatePostEditRequest from "../../../../validators/posts/postEditValidator";
import {
  uploadMultipleToStorage,
  deleteFromStorage,
} from "../../../../lib/storage/storage";

async function editPost(user, postId, fields, mediaToDelete, mediaToAdd) {
  await connectToDb();

  try {
    const post = await postModel.findById(postId).exec();

    if (!post) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Post does not exist.",
      };
    }

    if (!post.creator.equals(user._id)) {
      return {
        errorOccurred: true,
        httpCode: 401,
        message: "Unauthorized.",
      };
    }

    if (
      !fields.caption &&
      mediaToDelete.length === 0 &&
      mediaToAdd.length === 0
    ) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "No changes were found.",
      };
    }

    const changes = {};
    if (fields.caption) {
      changes.caption = fields.caption;
    }

    if (post.media.length === mediaToDelete.length && mediaToAdd.length === 0) {
      return {
        errorOccurred: true,
        httpCode: 400,
        message: "Cannot delete all media from post without adding any more.",
      };
    }

    for (const media of mediaToDelete) {
      await deleteFromStorage(media.replace("/storage/", ""));
    }

    const undeletedMediaUrls = post.media.filter(
      (media) => !mediaToDelete.includes(media.url)
    );

    const newlyAddedMediaUrls = await uploadMultipleToStorage(
      `posts/${post._id}`,
      mediaToAdd
    );
    let allNewMediaUrlsAndTypes = newlyAddedMediaUrls.map((url) => ({
      type: "image",
      url: url,
    }));

    allNewMediaUrlsAndTypes =
      allNewMediaUrlsAndTypes.concat(undeletedMediaUrls);

    await postModel
      .findByIdAndUpdate(postId, {
        $set: {
          caption: changes.caption,
          media: allNewMediaUrlsAndTypes,
        },
      })
      .exec();

    return {
      errorOccurred: false,
      httpCode: 200,
      message: "Post edited successfully.",
    };
  } catch (error) {
    return {
      errorOccurred: true,
      httpCode: 500,
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

  const validationResult = await validatePostEditRequest(formData.fields);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error.errors,
    });
  }

  const files = [];
  for (var filename in formData.files) {
    files.push(formData.files[filename]);
  }

  const result = await editPost(
    user,
    formData.fields.postId,
    formData.fields,
    JSON.parse(formData.fields.mediaToDelete),

    files
  );

  const status = result.httpCode;
  delete result.httpCode;
  return res.status(status).json({
    ...result,
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
