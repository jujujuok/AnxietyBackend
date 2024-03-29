import { FastifyReply, FastifyRequest } from "fastify";
import { DashboardService } from "./dashboard_service";
import { detailsRequest, updateRequest } from "../utils/fastifyRequests";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getDashboards(req: FastifyRequest, reply: FastifyReply) {
    const dashboards = await this.dashboardService.getDashboards();
    return reply.send(dashboards);
  }

  async getDashboardDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      return reply.status(400).send({
        message: "Dashboard ID is required",
      });
    }

    const dashboardId = req.params.id as number;
    const dashboardDetails = await this.dashboardService.getDashboardDetails(
      dashboardId
    );

    return reply.send(dashboardDetails);
  }

  async getDashboardUpdate(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      return reply.status(400).send({
        message: "Timestamp is required",
      });
    }

    const timestamp = req.query.timestamp as number;
    const dashboardUpdate = await this.dashboardService.getDashboardUpdate(
      timestamp
    );

    return reply.send(dashboardUpdate);
  }
}
