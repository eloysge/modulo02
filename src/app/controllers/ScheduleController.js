import {
  startOfDay,
  endOfDay,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isEqual,
  isBefore,
} from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

const range = [
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

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: {
        id: req.userID,
        provider: true,
      },
    });

    if (!checkUserProvider) {
      return res
        .status(401)
        .json({ error: 'O usuário deve ser um [provider]' });
    }

    const { date, timeZone = 'America/Sao_Paulo' } = req.query;
    if (!date) {
      return res
        .status(401)
        .json({ error: 'O parâmetro [date] é obrigatório' });
    }

    const parsedDate = zonedTimeToUtc(parseISO(date), timeZone);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userID,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
      order: ['date'],
    });

    const data = range.map(hour => {
      const [hora, minuto] = hour.split(':');
      const checkDate = setMilliseconds(
        setSeconds(setMinutes(setHours(parsedDate, hora), minuto), 0),
        0
      );

      const compareDate = zonedTimeToUtc(checkDate, timeZone);

      return {
        compareDate,
        actualDate: new Date(),
        time: `${hora}:${minuto}h`,
        past: isBefore(compareDate, new Date()),
        appointment: appointments.find(a => isEqual(a.date, compareDate)),
      };
    });

    return res.json(data);
  }
}

export default new ScheduleController();
