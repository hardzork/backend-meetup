import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    await Mail.sendMail({
      to: `${data.owner.name} <${data.owner.email}>`,
      subject: 'You have a new subscriber at your meeting',
      template: 'subscription',
      context: {
        owner: data.owner.name,
        user: data.user.name,
        email: data.user.email,
        meetup: data.meetup.name,
        date: format(parseISO(data.meetup.date), "dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new SubscriptionMail();
