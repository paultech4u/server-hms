/**
 * @typedef {(string|number)} NumberLike
 * @param  {NumberLike} status
 * @param  {String} message
 * @author Paulsimon
 */

exports.error = (status, message) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};
