import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { date } = req.query;
    const page = req.query.page || 1;
    const parsedDate = parseISO(date);

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [{ model: User, as: 'owner' }],
      offset: 10 * page - 10,
      limit: 10,
    });

    return res.json(meetups);
  }

  async show(req, res) {
    const paramsSchema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await paramsSchema.isValid(req.params))) {
      return res.status(400).json({ error: 'This is not a meetup id.' });
    }

    const { id } = req.params;
    const meetup = await Meetup.findOne({
      where: {
        id,
      },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: File, as: 'banner', attributes: ['id', 'path', 'url'] },
      ],
    });

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found.' });
    }

    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid.' });
    }

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userID,
    });
    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const paramsSchema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await paramsSchema.isValid(req.params))) {
      return res.status(400).json({ error: 'This is not a meetup id.' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found.' });
    }

    if (meetup.user_id !== req.userID) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups" });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const paramsSchema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await paramsSchema.isValid(req.params))) {
      return res.status(400).json({ error: 'This is not a meetup id.' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found.' });
    }

    if (meetup.user_id !== req.userID) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups" });
    }

    await meetup.destroy();
    return res.send();
  }
}

export default new MeetupController();
