/**
 * @typedef {(string|number)} NumberLike
 * @param  {NumberLike} status
 * @param  {String} msg
 * @author Paulsimon
 */

function error(status, msg) {
  const error = new Error(msg);
  error.status = status;
  throw error;
}

export default error;
