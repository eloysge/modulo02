import { Op } from 'sequelize';
import { subHours } from 'date-fns';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';

import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const searchDate = subHours(new Date(), 36);

    const appointment = await Appointment.findAll({
      where: {
        user_id: req.userID,
        canceled_at: null,
        date: {
          [Op.gte]: searchDate,
        },
      },
      attributes: [
        'id',
        'date',
        'user_id',
        'provider_id',
        'past',
        'cancelable',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      order: [['date', 'DESC']],
    });
    return res.json(appointment);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;

    const appointment = await CreateAppointmentService.run({
      provider_id,
      user_id: req.userID,
      date,
      timeZone: '-03:00',
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await CancelAppointmentService.run({
      appointment_id: req.params.id,
      user_id: req.userID,
      timeZone: '-03:00',
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
