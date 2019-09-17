import { parseISO, startOfDay, isEqual } from 'date-fns';
import Meetup from '../models/Meetup';

class OrganizingController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { user_id: req.userID } });
    const distinctDates = [
      ...new Set(meetups.map(meetup => startOfDay(meetup.date).toISOString())),
    ];
    const data = distinctDates.map(dt => {
      return {
        date: parseISO(dt),
        meetups: meetups.filter(meetup =>
          isEqual(parseISO(dt), startOfDay(meetup.date))
        ),
      };
    });
    return res.json(data);
  }
}

export default new OrganizingController();
