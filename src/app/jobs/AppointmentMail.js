import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class AppointmentMail {
  get key() {
    return 'AppointmentMail';
  }

  async handle({ data }) {
    const { newAppointment } = data;
    await Mail.sendMail({
      to: `${newAppointment.provider.name} <${newAppointment.provider.email}>`,
      subject: 'Novo Agendamento',
      template: 'appointment',
      context: {
        provider: newAppointment.provider.name,
        user: newAppointment.user.name,
        date: format(parseISO(newAppointment.date), 'dd/MM/yyyy HH:mm'),
      },
    });
  }
}

export default new AppointmentMail();
