import { isBefore, subHours, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

import QueryAppointmentService from './QueryAppointmentService';

class CancelAppointmentService {
  async run({ appointment_id, user_id, timeZone }) {
    const appointment = await QueryAppointmentService.run({
      appointment_id,
    });

    if (!appointment) {
      return {
        error: `Apontamento id: ${appointment_id}, não foi localizado.`,
      };
    }

    if (appointment.canceled_at) {
      return {
        error: `Esse apontamento já foi cancelado em: ${format(
          utcToZonedTime(appointment.canceled_at, timeZone),
          'dd/MM/yyyy HH:mm'
        )}.`,
      };
    }

    if (appointment.user_id !== user_id) {
      return {
        error: `Você não pode cancelar um Apontamento de outro usuário.`,
      };
    }

    const dateSub = subHours(appointment.date, 2);
    if (isBefore(dateSub, new Date())) {
      return {
        error: `Cancelamento não permitido. Ultrapassou a data limite: ${format(
          dateSub,
          'dd/MM/yyyy HH:mm'
        )}`,
      };
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    /**
     * Envio de email por Queue
     */
    await Queue.add(CancellationMail.key, {
      appointment,
      timeZone,
    });

    return appointment;
  }
}

export default new CancelAppointmentService();
