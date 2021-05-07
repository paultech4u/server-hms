import sg from "@sendgrid/mail";

const { SG_API_KEY } = process.env;

sg.setApiKey(SG_API_KEY);

/**
 * @param  {URL} uri
 * @param  {string} token access token
 * @param  {string} to receiving user email
 * @param  {string} name receiving user name
 */
export const comfirmationMSG = (to, uri, token, name) => {
  const msgTemplate = {
    to: to,
    from: "speak2donsimon@gmail.com",
    subject: "Hospital - Verify your account",
    templateId: "d-25f3d7c3fe2343109f0b3269b74b0bbd",
    dynamicTemplateData: {
      name: name,
      uri: `http://${uri}:4000/user/confirm-email?token=${token}`,
    },
  };
  sg.send(msgTemplate);
};
