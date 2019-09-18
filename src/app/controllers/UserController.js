import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const checkEmail = await User.findOne({ where: { email: req.body.email } });
    if (checkEmail) {
      return res.status(400).json({ error: 'Email já cadastrado !' });
    }

    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
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

    // eslint-disable-next-line func-names
    await schema.validate(req.body).catch(function(err) {
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados', type: [err.errors] });
    });

    // if (!(await schema.isValid(req.body))) {
    //   return res.status(400).json({ error: 'Falha na validação dos dados' });
    // }

    const { email, oldPassword, password } = req.body;
    const user = await User.findByPk(req.userID);

    if (email !== user.email) {
      const checkEmail = await User.findOne({ where: { email } });
      if (checkEmail) {
        return res.status(400).json({ error: 'Email já cadastrado !' });
      }
    }

    if (password && !oldPassword) {
      return res
        .status(401)
        .json({ error: 'Para alterar a senha, informe a senha anterior' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha anterior não confere' });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userID, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
