import sg from "@sendgrid/mail";

const { SG_API_KEY } = process.env;

sg.setApiKey(SG_API_KEY);
export const activationEmail = (to, uri, token, name) => {
  const msg = {
    to: to,
    from: "noreply@gmail.com",
    subject: "Hospital - Verify your account",
    templateId: "d-25f3d7c3fe2343109f0b3269b74b0bbd",
    dynamicTemplateData: {
      name: name,
      label: `<a style="text-decoration:none; color: white; cursor: pointer;display:inline-block" href="http://${uri}:4000/user/confirm-email?token=${token}">Verify account</a>`,
    },
  };
  sg.send(msg);
};

export const deactivationEmail = (to, name) => {
  const msg = {
    to: to,
    from: "noreply@gmail.com",
    subject: "Hospital - Account deactivated",
    templateId: "d-25f3d7c3fe2343109f0b3269b74b0bbd",
    dynamicTemplateData: {
      name: name,
    },
  };
  sg.send(msg);
};
