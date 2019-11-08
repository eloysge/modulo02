import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { utcToZonedTime } from 'date-fns-tz';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import AppointmentMail from '../jobs/AppointmentMail';
import Queue from '../../lib/Queue';

import QueryAppointmentService from './QueryAppointmentService';

class CreateAppointmentService {
  async run({ provider_id, user_id, date, timeZone }) {
    /**
     * Checar se usuário indicado é um "provider".
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!isProvider) {
      return { error: 'Agendamento apenas permitido para [providers]' };
      // throw new Error('Agendamento apenas permitido para [providers]');
    }

    /**
     * Checar se a data é posterior
     */
    const hourStart = startOfHour(parseISO(date));
    const actualDate = format(
      utcToZonedTime(new Date(), timeZone),
      "dd/MM/yyyy H:mm'h'",
      {
        locale: pt,
      }
    );
    if (isBefore(hourStart, new Date())) {
      return {
        error: `A data do agendamento deve ser posterior a ${actualDate}`,
      };
    }

    /**
     * Checar conflito de agendamento para usuario
     */
    const checkConflit = await Appointment.findOne({
      where: {
        user_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkConflit) {
      return { error: 'Você já tem um agendamento para este horário' };
    }

    /**
     * Checar disponibilidade do data do agendamento
     */
    const checkAvailable = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkAvailable) {
      return { error: 'A data do agendamento não está disponível' };
    }

    const appointment = await Appointment.create({
      user_id,
      date: hourStart,
      provider_id,
    });

    /**
     * Noficar agendamento ao provider
     */
    const user = await User.findByPk(user_id);
    const formattedDate = format(
      utcToZonedTime(hourStart, timeZone),
      "'dia' dd 'de' MMMM 'às' H:mm'h'",
      {
        locale: pt,
      }
    );
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    /**
     * Envio de email ao provider
     */
    const newAppointment = await QueryAppointmentService.run({
      appointment_id: appointment.id,
    });

    await Queue.add(AppointmentMail.key, {
      newAppointment,
      timeZone,
    });

    return newAppointment;
  }
}

export default new CreateAppointmentService();
