import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import User from '../models/User';
import Appointment from '../models/Appointment';

class AvailableService {
  async run({ provider_id, date, timeZone }) {
    const checkUserProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });
    if (!checkUserProvider) {
      return {
        error: `O usuário: ${provider_id} não é um [provider].`,
      };
    }

    const appointments = await Appointment.findAll({
      where: {
        provider_id,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
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
      const value = setSeconds(setMinutes(setHours(date, hour), minute), 0);

      const cliente = appointments.find(
        appointment =>
          format(utcToZonedTime(appointment.date, timeZone), 'HH:mm') === time
      );

      return {
        time,
        value: format(
          zonedTimeToUtc(value, timeZone),
          "yyyy-MM-dd'T'HH:mm:ssxxx"
        ),
        available: isAfter(value, compareDate) && !cliente,
      };
    });

    return available;
  }
}

export default new AvailableService();
