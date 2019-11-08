import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required('Nome do usuário é obrigatório'),
      email: Yup.string()
        .email('E-mail informado é inválido')
        .required('E-mail é obrigatório'),
      oldPassword: Yup.string().min(
        6,
        'A senha atual deve ter no mínimo 6 dígitos'
      ),
      password: Yup.string()
        .min(6, 'A nova senha deve ter no mínimo 6 dígitos')
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      newPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('Informe a confirmação da senha (newPassword)')
              .oneOf(
                [Yup.ref('password')],
                'A confirmação da nova senha falhou'
              )
          : field
      ),
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
