import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Meetup from '../models/Meetup';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userID,
      },
      include: [{ model: Meetup, where: { date: { [Op.gt]: new Date() } } }],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userID);
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });
    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found.' });
    }

    if (meetup.user_id === req.userID) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to you own meetups" });
    }
    if (meetup.past) {
      return res.status(400).json({ error: "Can't subscribe to past meetups" });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [{ model: Meetup, where: { date: meetup.date } }],
    });
    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time." });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });
    const mailData = {
      owner: {
        name: meetup.User.name,
        email: meetup.User.email,
      },
      user: {
        name: user.name,
        email: user.email,
      },
      meetup: {
        name: meetup.title,
        date: meetup.date,
      },
    };

    await Queue.add(SubscriptionMail.key, mailData);

    return res.json(subscription);
  }
}

export default new SubscriptionController();
