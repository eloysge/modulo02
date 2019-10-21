import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  startOfHour,
  parseISO,
  isBefore,
  format,
  subHours,
  subDays,
} from 'date-fns';
import pt from 'date-fns/locale/pt';
import { utcToZonedTime } from 'date-fns-tz';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import CancellationMail from '../jobs/CancellationMail';
import AppointmentMail from '../jobs/AppointmentMail';
import Queue from '../../lib/Queue';
// import Mail from '../../lib/Mail';

class AppointmentController {
  async index(req, res) {
    const { page = 1, timeZone = 'America/Sao_Paulo' } = req.query;

    const searchDate = Number(subDays(utcToZonedTime(new Date(), timeZone), 1));

    const appointment = await Appointment.findAll({
      where: {
        user_id: req.userID,
        canceled_at: null,
        date: {
          [Op.gte]: searchDate,
        },
      },
      attributes: [
        'id',
        'date',
        'user_id',
        'provider_id',
        'past',
        'cancelable',
      ],
      limit: 20,
      offset: (page - 1) * 20,
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
      order: [['date', 'DESC']],
    });
    return res.json(appointment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number('O ID deve ser numérico').required(
        'O ID é obrigatório'
      ),
      date: Yup.date('A Data deve ser válida').required('A Data é obrigatória'),
    });

    if (!(await schema.isValid(req.body))) {
      await schema.validate(req.body).catch(err => {
        const { message } = err;
        return res.json({ error: message });
      });
      return res.status(400);
    }

    const { provider_id, date, timeZone = 'America/Sao_Paulo' } = req.body;

    /**
     * Checar se usuário indicado é um "provider".
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!isProvider) {
      return res
        .json({
          error: 'Agendamento apenas permitido para [providers]',
        })
        .status(400);
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

    if (isBefore(hourStart, utcToZonedTime(new Date(), timeZone))) {
      return res
        .json({
          error: `A data do agendamento deve ser posterior a ${actualDate}`,
        })
        .status(400);
    }

    /**
     * Checar conflito de agendamento para usuario
     */
    const checkConflit = await Appointment.findOne({
      where: {
        user_id: req.userID,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkConflit) {
      return res
        .json({
          error: 'Você já tem um agendamento para este horário',
        })
        .status(400);
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
        .json({ error: 'A data do agendamento não está disponível' })
        .status(400);
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

    /**
     * Envio de email ao provider
     */
    const newAppointment = await Appointment.findByPk(appointment.id, {
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
    await Queue.add(AppointmentMail.key, {
      newAppointment,
    });

    return res.json(newAppointment);
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
      return res
        .json({ error: `Apontamento: ${req.params.id} não localizado.` })
        .status(400);
    }

    if (appointment.canceled_at) {
      return res
        .json({
          error: `Esse apontamento já foi cancelado em: ${format(
            appointment.canceled_at,
            'dd/MM/yyyy HH:mm'
          )}.`,
        })
        .status(401);
    }

    if (appointment.user_id !== req.userID) {
      return res
        .json({
          error: `Você não pode cancelar um Apontamento de outro usuário.`,
        })
        .status(401);
    }

    const timeZone = 'America/Sao_Paulo';
    const dateSub = subHours(appointment.date, 2);
    if (isBefore(dateSub, utcToZonedTime(new Date(), timeZone))) {
      return res
        .json({
          error: `Cancelamento não permitido. Ultrapassou a data limite: ${format(
            dateSub,
            'dd/MM/yyyy HH:mm'
          )}`,
        })
        .status(401);
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    /**
     * Envio de email por Queue
     */
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
