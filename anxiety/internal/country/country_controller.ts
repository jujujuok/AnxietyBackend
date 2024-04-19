import { FastifyReply, FastifyRequest } from "fastify";
import { CountryService } from "./country_service";
import { detailsRequest, updateRequest } from "../utils/fastifyRequests";

/**
 * Controller for the country module
 */
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  /**
   * Get list of country items
   * @param req FastifyRequest
   * @param reply FastifyReply
   * @returns List of country items
   */
  async getCountry(req: FastifyRequest, reply: FastifyReply) {
    const countryData = await this.countryService.getCountry();
    return reply.send(countryData);
  }

  /**
   * Get details of a country item
   * @param req FastifyRequest for details
   * @param reply FastifyReply
   * @returns Details of a country item
   */
  async getCountryDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      return reply.status(400).send({
        message: "Country ID is required",
      });
    }

    const countryId = req.params.id as number;
    const countryDetails =
      await this.countryService.getCountryDetails(countryId);

    return reply.send(countryDetails);
  }

  /**
   * Get update of the countries list
   * @param req FastifyRequest for update
   * @param reply FastifyReply
   * @returns Update of the countries list containing ids to remove and objects to add
   */
  async getCountryUpdate(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      return reply.status(400).send({
        message: "Timestamp is required",
      });
    }

    const timestamp = req.query.timestamp as number;
    const countryUpdate = await this.countryService.getCountryUpdate(timestamp);

    return reply.send(countryUpdate);
  }
}
