import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      provider_id: Yup.number('O ID deve ser numérico').required(
        'O ID é obrigatório'
      ),
      date: Yup.date('A Data deve ser válida').required('A Data é obrigatória'),
    });

    await schema.validate(req.body, { abortEarly: false });
    return next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
