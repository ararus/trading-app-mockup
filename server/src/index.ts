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

const subscriptions = new Map<string, Subscription>();

// WS routes
app.ws.use(
  route.all("/api/ws", (ctx) => {
    try {
      console.log(`Client connected`);
      ctx.websocket.on("message", (rawMessage: any) => {
        const message = JSON.parse(rawMessage);

        if (message.type === "unsubscribe") {
          subscriptions.get(message.key)!.unsubscribe();
        } else {
          if (message.name === "tokenPairs") {
            subscriptions.set(
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
            subscriptions.set(
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
            subscriptions.set(
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
            subscriptions.set(
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
