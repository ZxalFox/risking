import { createParamDecorator } from "@nestjs/common";
export const CurrentUser = createParamDecorator((_data, ctx) => {
    if (ctx.getType() === "http") {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
    if (ctx.getType() === "ws") {
        const client = ctx.switchToWs().getClient();
        return client.user;
    }
    return undefined;
});
//# sourceMappingURL=current-user.decorator.js.map