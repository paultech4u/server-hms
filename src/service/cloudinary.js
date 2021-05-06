import cloudinary from 'cloudinary';

const {
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

cloudinary.v2.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const SaveToCloudinary = function (file, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      file,
      { folder: folder, tags: 'avatar' },
      (error, result) => {
        resolve({ result: result });
        reject(error);
      }
    );
  });
};

export const GetCloudFile = function (file) {};
