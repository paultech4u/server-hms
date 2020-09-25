import sg from "@sendgrid/mail";

const { SENDGRID_API_KEY } = process.env;

sg.setApiKey(SENDGRID_API_KEY);
export const VerifyEmail = (to, uri, token, name) => {
  const msg = {
    to: to,
    from: "speak2donsimon@gmail.com",
    subject: "General hospital - Verify your account",
    templateId: "d-25f3d7c3fe2343109f0b3269b74b0bbd",
    dynamicTemplateData: {
      fullName: name,
      uri: `<a style="text-decoration:none; color: white; cursor: pointer;display:inline-block" href="http://${uri}:4000/user/verify-email?token=${token}">Verify account</a>`,
      token: token,
    },
  };
  sg.send(msg);
};
