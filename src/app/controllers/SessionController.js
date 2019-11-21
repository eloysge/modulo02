import jwt from 'jsonwebtoken';
import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
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
    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    return res.json({
      user: {
        id,
        name,
        email,
        provider,
        avatar,
        timeLive: authConfig.expiresIn,
      },
      token,
    });
  }
}

export default new SessionController();
