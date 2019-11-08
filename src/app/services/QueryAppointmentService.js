import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';

class QueryAppointmentService {
  async run({ appointment_id }) {
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email', 'avatar_id'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    return appointment;
  }
}
export default new QueryAppointmentService();
