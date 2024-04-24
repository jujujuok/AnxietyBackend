import { FastifyReply, FastifyRequest } from "fastify";
import { DashboardService } from "./dashboard_service";
import { detailsRequest, updateRequest } from "../utils/fastifyRequests";

/**
 * Controller for the dashboard module
 */
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get list of dashboard items
   * @param req FastifyRequest
   * @param reply FastifyReply
   * @returns List of dashboard items
   */
  async getDashboard(req: FastifyRequest, reply: FastifyReply) {
    const dashboardData = await this.dashboardService.getDashboard();
    return reply.send(dashboardData);
  }

  /**
   * Get details of a dashboard item
   * @param req FastifyRequest for details
   * @param reply FastifyReply
   * @returns Details of a dashboard item
   */
  async getDashboardDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      return reply.status(400).send({
        message: "Dashboard ID is required",
      });
    }

    const dashboardId = req.params.id;
    const dashboardDetails = await this.dashboardService.getDashboardDetails(
      dashboardId,
    );

    return reply.send(dashboardDetails);
  }

  /**
   * Get update of the dashboard list
   * @param req FastifyRequest for update
   * @param reply FastifyReply
   * @returns Update of the dashboard list containing ids to remove and objects to add
   */
  async getDashboardUpdate(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      return reply.status(400).send({
        message: "Timestamp is required",
      });
    }

    const timestamp = req.query.timestamp as number;
    const dashboardUpdate = await this.dashboardService.getDashboardUpdate(
      timestamp,
    );

    return reply.send(dashboardUpdate);
  }
}
