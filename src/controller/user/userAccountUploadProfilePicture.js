import fs from 'fs';
import { User } from '../../model/user';
import { SaveToClouds } from '../../service/cloudinary';


/**
 * 
 * @typedef {{}} Request
 * @typedef {{}} Response
 * @typedef {{}} NextFunction
 */

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */

export async function uploadProfileAvatar(req, res, next) {
  const imageUrl = req.file;
  const { userId } = req;
  try {
    // TODO check if user exist
    const user = await User.findById(userID);
    if (!user) {
      ErrorException(404, 'User does not exists');
    }

    // upload the image file to cloudinary 
    const uploadImageToCloud = async function (path) {
      const result = await SaveToClouds(path, 'Images');
      return result;
    };
    const { result } = await uploadImageToCloud(imageUrl.path);
    // Remove saved image URL from uploads
    fs.unlinkSync(imageUrl.path);

    // TODO assigned cloudinary url to user imageUrl path
    user.imageUrl = result.url;

    const [u] = await Promise.all([user.save()]);
    if (!u) {
      ErrorException(404, 'Upload not successful');
    }
    res.status(200).json({
      message: 'Successfully uploaded profile picture',
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

export const getProfileAvatar = function (req, res, next) {};

export const changeProfileAvatar = function (req, res, next) {};
