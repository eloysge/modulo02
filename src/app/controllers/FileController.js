import File from '../models/File';
import User from '../models/User';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;
    const file = await File.create({
      name,
      path,
    });

    // Adicionei as linhas abaixo para setar o avatar_id
    // no momento do upload do arquivo
    const user = await User.findByPk(req.userID);
    if (user) {
      user.update({ avatar_id: file.id });
    }

    return res.json(file);
  }
}

export default new FileController();
