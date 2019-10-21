import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

class Appointment extends Model {
  static init(sequelize) {
    const timeZone = 'America/Sao_Paulo';
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, utcToZonedTime(new Date(), timeZone));
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(
              utcToZonedTime(new Date(), timeZone),
              subHours(this.date, 2)
            );
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;
