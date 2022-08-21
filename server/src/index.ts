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
import { DummyServer } from "./fakeData";
import { Subscription } from "rxjs";
import { IStreamReply, IStreamRequest } from "./dtos";

const koaValidator = require("koa-async-validator");

const app = websockify(new Koa());

app.use(koaBody());
app.use(koaValidator());
app.use(cors());
app.use(koaLogger());

// REST routes
app.use(route.get("/healthcheck", (ctx) => (ctx.body = "OK")));

const dummy = new DummyServer();

class Client {
  public id: string;
  public subscriptions: Map<string, Subscription>;

  constructor(id: string) {
    this.id = id;
    this.subscriptions = new Map();
  }
}

const clients = new Map<WebSocket, Client>();

// WS routes
app.ws.use(
  route.all("/api/ws", (ctx) => {
    try {
      const id = uuid.v4();
      const client = new Client(id);
      clients.set(ctx.websocket, client);
      console.log(`Client connected. Id: "${id}"`);

      ctx.websocket.on("message", (rawMessage: any) => {
        const client = clients.get(ctx.websocket)!;
        const message = JSON.parse(rawMessage);
        console.log(`Message from client "${client.id}": ${message.type}`);

        if (message.type === "unsubscribe") {
          client.subscriptions.get(message.key)!.unsubscribe();
        } else {
          if (message.name === "tokenPairs") {
            client.subscriptions.set(
              message.key,
              dummy.getTokenPairs().subscribe((tokenPairs) => {
                ctx.websocket.send(
                  JSON.stringify({
                    type: "tokenPairs",
                    key: message.key,
                    data: tokenPairs,
                  })
                );
              })
            );
          } else if (message.name === "tokenPrices") {
            client.subscriptions.set(
              message.key,
              dummy.getPriceStream().subscribe((prices) => {
                ctx.websocket.send(
                  JSON.stringify({
                    type: "tokenPrices",
                    key: message.key,
                    data: prices,
                  })
                );
              })
            );
          } else if (message.name === "orderBook") {
            client.subscriptions.set(
              message.key,
              dummy.getOrderBook
                .apply(dummy, message.data)
                .subscribe((orderBook) => {
                  ctx.websocket.send(
                    JSON.stringify({
                      type: "orderBook",
                      key: message.key,
                      data: orderBook,
                    })
                  );
                })
            );
          } else if (message.name === "openOrders") {
            client.subscriptions.set(
              message.key,
              dummy.getOpenOrders().subscribe((openOrders) => {
                ctx.websocket.send(
                  JSON.stringify({
                    type: "openOrders",
                    key: message.key,
                    data: openOrders,
                  })
                );
              })
            );
          }
        }
      });

      ctx.websocket.on("close", () => {
        const client = clients.get(ctx.websocket)!;
        for (let s of client.subscriptions.values()) {
          s.unsubscribe();
        }
        clients.delete(ctx.websocket);
        console.log(`Client disconnected`);
      });

      ctx.websocket.on("error", () => {
        console.log(`WEBSOCKET ERROR`);
      });
    } catch (e) {
      console.log(`ERROR`, e);
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
