import Koa from "koa";
import koaBody from "koa-body";
import cors from "@koa/cors";
import serve from "koa-static";
import koaLogger from "koa-logger";
import { config } from "./config";
import websockify from "koa-websocket";
import route from "koa-route";
import * as uuid from "uuid";
import { WebSocket } from "ws";
import { MessageHandler } from "./fakeData";

const koaValidator = require("koa-async-validator");

const app = websockify(new Koa());

app.use(koaBody());
app.use(koaValidator());
app.use(cors());
app.use(koaLogger());

// REST routes
app.use(route.get("/healthcheck", (ctx) => (ctx.body = "OK")));

export interface IClient {
  name: string;
  socket: WebSocket;
}

const messageHandler = new MessageHandler();

// WS routes
app.ws.use(
  route.all("/api/prices", (ctx) => {
    try {
      console.log(`Client connected`);
      const client: IClient = {
        name: uuid.v4(),
        socket: ctx.websocket,
      };
      ctx.websocket.on("message", (message) => {
        const reply = messageHandler.onMessage(message);
        ctx.websocket.send(reply);
      });
      ctx.websocket.on("close", () => {
        console.log(`Client disconnected`);
      });
    } catch (e) {
      console.log(`Error`, e);
    }
  })
);

app.use(serve("public"));

// app.use(koaSwagger({
//   routePrefix: '/swagger',
//   swaggerOptions: {
//     url: "/swagger.yml"
//   }
// }));

export const server = app.listen(config.port);

console.log(`Server running on port ${config.port}`);
