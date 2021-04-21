/**
 * @param  {number} status
 * @param  {string} massage
 *
 * @author Paultech4u
 */
export function errorHandler(status, massage) {
  const error = new Error();
  error.status = status;
  error.message = massage;
  throw error;
}
