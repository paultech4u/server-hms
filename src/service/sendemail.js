import sg from "@sendgrid/mail";

const { SENDGRID_API_KEY } = process.env;

sg.setApiKey(SENDGRID_API_KEY);
export const VerifyEmail = (to, uri, token, name) => {
  const msg = {
    to: to,
    from: "speak2donsimon@gmail.com",
    subject: "General hospital - Verify your account",
    html: `
       <h1>Hello, ${name}</h1>
       <p>Click this link below to verify your account</p>
       <a href="http://${uri}:4000/user/verify-email?token=${token}">Verify account</a>
    `,
  };
  sg.send(msg);
};
