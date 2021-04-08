import fs from 'fs';
import { User } from '../../model/user';
import { SaveToCloudinary } from '../../service/cloudinary';

/**
 *
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 */

/**
 *
 * @param {Request} req object
 * @param {Response} res object
 * @param {NextFunction} next middleware function
 */

export async function uploadProfilePicture(req, res, next) {
  // image url file
  const imageUrl = req.file;

  // user id
  const { userId } = req;

  try {
    // check if user exist
    const user = await User.findById(userId);
    if (!user) {
      ErrorException(404, 'User does not exists');
    }

    let CLOUDINARY_FOLDER_NAME = 'Images';

    // upload the image file to cloudinary
    const uploadImageToCloudinary = async function (path) {
      return await SaveToCloudinary(path, CLOUDINARY_FOLDER_NAME);
    };

    const imageFile = await uploadImageToCloudinary(imageUrl.path);
    console.log(imageFile);

    // remove saved image URL from uploads
    fs.unlinkSync(imageUrl.path);

    // update user profile image
    const updatedUserProfileImage = new User({
      imageUrl: imageFile.url,
    });

    const imageUploadSaved = updatedUserProfileImage.save();

    if (!imageUploadSaved) {
      ErrorException(404, 'Upload not successful');
    }

    return res.status(200).json({
      message: 'uploaded successful',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
}

export const getProfileAvatar = function (req, res, next) {};

export const changeProfileAvatar = function (req, res, next) {};
