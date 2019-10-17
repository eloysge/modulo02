import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
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

    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      return res.json({ error: 'Usuário não cadastrado.' }).status(401);
    }

    if (!(await user.checkPassword(password))) {
      return res.json({ error: 'Senha não confere' }).status(401);
    }

    const { id, name, avatar, provider } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        provider,
        avatar,
        timeLive: authConfig.expiresIn,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
