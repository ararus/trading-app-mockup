export class TokenPair {
  public readonly baseToken: string;
  public readonly quoteToken: string;

  constructor(baseToken: string, quoteToken: string) {
    this.baseToken = baseToken;
    this.quoteToken = quoteToken;
  }

  public get name() {
    return [this.baseToken, this.quoteToken].join("/");
  }
}
