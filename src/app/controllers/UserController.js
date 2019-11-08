import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
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
