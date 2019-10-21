import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date, timeZone = 'America/Sao_Paulo' } = req.query;

    if (!date) {
      return res.status(400).json({
        error: `A Data não foi informada.`,
      });
    }

    const searchDate = Number(date);
    const checkUserProvider = await User.findOne({
      where: {
        id: req.params.providerID,
        provider: true,
      },
    });
    if (!checkUserProvider) {
      return res.status(401).json({
        error: `O usuário: ${req.params.providerID} não é um [provider].`,
      });
    }

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerID,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
      order: ['date'],
      attributes: ['id', 'date', 'user_id', 'provider_id'],

      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const compareDate = utcToZonedTime(new Date(), timeZone);

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      const cliente = appointments.find(
        appointment => format(appointment.date, 'HH:mm') === time
      );

      return {
        time,
        value: format(zonedTimeToUtc(value), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available: isAfter(value, compareDate) && !cliente,
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
