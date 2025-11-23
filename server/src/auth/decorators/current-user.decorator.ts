import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../strategies/jwt.strategy.js";

type RequestWithUser = {
  user?: JwtPayload;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    if (ctx.getType() === "http") {
      const request = ctx.switchToHttp().getRequest<RequestWithUser>();
      return request.user;
    }

    if (ctx.getType() === "ws") {
      const client = ctx.switchToWs().getClient<RequestWithUser>();
      return client.user;
    }

    return undefined;
  }
);
