import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import Mail from '../../lib/Mail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointment = await Appointment.findAll({
      where: {
        user_id: req.userID,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date', 'user_id', 'provider_id'],
      limit: 3,
      offset: (page - 1) * 3,
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
    });
    return res.json(appointment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    // eslint-disable-next-line func-names
    await schema.validate(req.body).catch(function(err) {
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados', type: [err.errors] });
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Falha na validação' });
    }

    const { provider_id, date } = req.body;

    /**
     * Checar se usuário indicado é um "provider".
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Agendamento apenas permitido para [providers]' });
    }

    /**
     * Checar se a data é posterior
     */
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: `A data do agendamento deve ser posterior a ${Date()}`,
      });
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
      return res
        .status(400)
        .json({ error: 'A data do agendamento não está disponível' });
    }

    const appointment = await Appointment.create({
      user_id: req.userID,
      date: hourStart,
      provider_id,
    });

    /**
     * Noficar agendamento ao provider
     */
    const user = await User.findByPk(req.userID);

    const formattedDate = format(hourStart, "'dia' dd 'de' MMMM 'às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!appointment) {
      res
        .status(400)
        .json({ error: `Apontamento: ${req.params.id} não localizado.` });
    }

    if (appointment.canceled_at) {
      res.status(401).json({
        error: `Esse apontamento já foi cancelado em: ${format(
          appointment.canceled_at,
          'dd/MM/yyyy HH:mm'
        )}.`,
      });
    }

    if (appointment.user_id !== req.userID) {
      res.status(401).json({
        error: `Você não pode cancelar esse Apontamento: ${req.params.id}.`,
      });
    }

    const dateSub = subHours(appointment.date, 2);
    if (isBefore(dateSub, new Date())) {
      res.status(401).json({
        error: `Cancelamento não permitido. Ultrapassou a data limite: ${format(
          dateSub,
          'dd/MM/yyyy HH:mm'
        )}`,
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    /**
     * Envio de email
     */
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(appointment.date, 'dd/MM/yyyy HH:mm'),
      },
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
