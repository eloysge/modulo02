import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { appointment, timeZone } = data;
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          utcToZonedTime(appointment.date, timeZone),
          'dd/MM/yyyy HH:mm'
        ),
        timeZone,
        avatar: appointment.provider.avatar.url,
      },
    });
  }
}

export default new CancellationMail();
