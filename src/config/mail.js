/*
export default {
  host: 'smtp.mailtrap.io',
  port: 587,
  secure: false,
  auth: {
    user: '14f10a5fe6f4f3',
    pass: '6558cdc7307eca',
  },
  default: {
    from: 'Equipe GoBarber <email@sgeinformatica.com.br>',
  },
};
*/
export default {
  host: `${process.env.MAIL_HOST}`,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === true,
  auth: {
    user: `${process.env.MAIL_USER}`,
    pass: `${process.env.MAIL_PASS}`,
  },
  default: {
    from: 'Equipe GoBarber <email@sgeinformatica.com.br>',
  },
};
