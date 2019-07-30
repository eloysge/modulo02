import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userID, provider: true },
    });
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Notificações permitido apenas para [providers]' });
    }

    const notifications = await Notification.find({
      user: req.userID,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }
}

export default new NotificationController();
