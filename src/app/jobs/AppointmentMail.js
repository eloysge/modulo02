import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import Mail from '../../lib/Mail';

class AppointmentMail {
  get key() {
    return 'AppointmentMail';
  }

  async handle({ data }) {
    const { newAppointment } = data;
    const { timeZone } = data;
    await Mail.sendMail({
      to: `${newAppointment.provider.name} <${newAppointment.provider.email}>`,
      subject: 'Novo Agendamento',
      template: 'appointment',
      context: {
        provider: newAppointment.provider.name,
        user: newAppointment.user.name,
        date: format(
          parseISO(utcToZonedTime(newAppointment.date, timeZone)),
          'dd/MM/yyyy HH:mm'
        ),
      },
    });
  }
}

export default new AppointmentMail();
