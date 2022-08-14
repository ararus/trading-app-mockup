export interface IConfig {
  port: number;
}

export const config: IConfig = {
  port: process.env.NODE_PORT ? parseInt(process.env.NODE_PORT, 10) : 3000,
}