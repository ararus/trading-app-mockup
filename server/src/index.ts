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

const koaValidator = require("koa-async-validator");

const app = websockify(new Koa());

app.use(koaBody());
app.use(koaValidator());
app.use(cors());
app.use(koaLogger());

// REST routes
app.use(route.get("/healthcheck", (ctx) => (ctx.body = "OK")));

const dummy = new DummyServer();
let tokenPairsSub: Subscription;
let pricesSub: Subscription;
let orderBookSub: Subscription;

// WS routes
app.ws.use(
  route.all("/api/ws", (ctx) => {
    try {
      console.log(`Client connected`);
      ctx.websocket.on("message", (rawMessage: any) => {
        const message = JSON.parse(rawMessage);
        if (message.hasOwnProperty("subscribe")) {
          if (message.subscribe === "tokenPairs") {
            tokenPairsSub = dummy.getTokenPairs().subscribe((tokenPairs) => {
              ctx.websocket.send(
                JSON.stringify({ type: "tokenPairs", data: tokenPairs })
              );
            });
          } else if (message.subscribe === "tokenPrices") {
            pricesSub = dummy.getPriceStream().subscribe((prices) => {
              ctx.websocket.send(
                JSON.stringify({ type: "tokenPrices", data: prices })
              );
            });
          } else if (message.subscribe === "orderBook") {
            orderBookSub = dummy
              .getOrderBook(message.tokenPair, message.priceLevelSize)
              .subscribe((orderBook) => {
                ctx.websocket.send(
                  JSON.stringify({
                    type: "orderBook",
                    tokenPair: message.tokenPair,
                    priceLevelSize: message.priceLevelSize,
                    data: orderBook,
                  })
                );
              });
          }
        } else if (message.hasOwnProperty("unsubscribe")) {
          if (message.unsubscribe === "tokenPairs") {
            tokenPairsSub.unsubscribe();
          } else if (message.unsubscribe === "tokenPrices") {
            pricesSub.unsubscribe();
          } else if (message.unsubscribe === "orderBook") {
            orderBookSub.unsubscribe();
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
