/**
 * @typedef {Number} status
 * @param  {number} status
 * @param  {string} msg
 * 
 * @author Paultech4u
 */
export function ErrorExceptionMessage(status, msg) {
  const error = new Error(msg);
  error.status = status;
  throw error;
}
