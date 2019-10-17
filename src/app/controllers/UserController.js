import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('O nome é obrigatório'),
      email: Yup.string()
        .email('E-mail é inválido')
        .required('O e-mail é obrigatório'),
      password: Yup.string()
        .required('A senha é obrigatória')
        .min(6, 'A senha deve ter no mínimo 6 dígitos'),
    });

    if (!(await schema.isValid(req.body))) {
      await schema.validate(req.body).catch(err => {
        const { message } = err;
        return res.json({ error: message });
      });
      return res.status(400);
    }

    const checkEmail = await User.findOne({ where: { email: req.body.email } });
    if (checkEmail) {
      return res.json({ error: 'E-mail já cadastrado' }).status(400);
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

    if (!(await schema.isValid(req.body))) {
      await schema.validate(req.body).catch(err => {
        const { message } = err;
        return res.json({ error: message });
      });
      return res.status(400);
    }

    const { email, oldPassword, password } = req.body;
    const user = await User.findByPk(req.userID);

    if (email !== user.email) {
      const checkEmail = await User.findOne({ where: { email } });
      if (checkEmail) {
        return res.json({ error: 'Email já cadastrado !' }).status(400);
      }
    }

    if (password && !oldPassword) {
      return res
        .json({
          error: 'Para alterar a senha, informe a senha anterior',
        })
        .status(400);
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.json({ error: 'Senha anterior não confere' }).status(400);
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
