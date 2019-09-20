import { parseISO, startOfDay, endOfDay, isEqual } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';

class OrganizingController {
  async index(req, res) {
    const { startDate, endDate } = req.query;
    const parsedStartDate = parseISO(startDate);
    const parsedEndDate = parseISO(endDate);
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userID,
        date: {
          [Op.between]: [startOfDay(parsedStartDate), endOfDay(parsedEndDate)],
        },
      },
    });
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
