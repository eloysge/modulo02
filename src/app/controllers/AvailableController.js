import AvailableService from '../services/AvailableService';

class AvailableController {
  async index(req, res) {
    const { date, timeZone = '-03:00' } = req.query;

    if (!date) {
      return res.status(400).json({
        error: `A Data não foi informada.`,
      });
    }

    const searchDate = Number(date);

    const available = await AvailableService.run({
      provider_id: req.params.providerID,
      date: searchDate,
      timeZone,
    });

    return res.json(available);
  }
}

export default new AvailableController();
