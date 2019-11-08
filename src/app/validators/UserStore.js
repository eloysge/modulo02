import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required('O nome é obrigatório'),
      email: Yup.string()
        .email('E-mail é inválido')
        .required('O e-mail é obrigatório'),
      password: Yup.string()
        .required('A senha é obrigatória')
        .min(6, 'A senha deve ter no mínimo 6 dígitos'),
    });

    await schema.validate(req.body, { abortEarly: false });
    return next();

    // if (!(await schema.isValid(req.body))) {
    //   await schema.validate(req.body).catch(err => {
    //     const { message } = err;
    //     return res.json({ error: message });
    //   });
    //   return res.status(400);
    // }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
