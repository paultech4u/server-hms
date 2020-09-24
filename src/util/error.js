/**
 * @typedef {(string|number)} NumberLike
 * @param  {NumberLike} status
 * @param  {String} message
 * @author Paulsimon
 */

function error(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

module.exports = { error };
