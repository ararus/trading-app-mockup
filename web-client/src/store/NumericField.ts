import { action, computed, makeObservable, observable } from "mobx";

export class NumericField {
  private readonly _value = observable.box<number | undefined>();
  private readonly _input = observable.box<string>("");
  private readonly _isDisabled = observable.box<boolean>(false);
  private readonly _precision = observable.box<number>(2);
  private readonly _isFocused = observable.box<boolean>(false);

  constructor(value: number | undefined, precision: number = 2) {
    makeObservable(this, {
      value: computed,
      text: computed,
      input: computed,
      isFocused: computed,
      precision: computed,
      setInput: action,
      setValue: action,
      setPrecision: action,
      setFocused: action,
      setDisabled: action,
    });
    this.setPrecision(precision);
    this.setValue(value);
  }

  public get value() {
    return this._value.get();
  }

  public get text() {
    if (this.isFocused) {
      return this.input || "";
    }
    if (this.value === undefined) {
      return "";
    }
    return this.value.toFixed(this.precision);
  }

  public get input() {
    return this._input.get();
  }

  public get isFocused() {
    return this._isFocused.get();
  }

  public get precision() {
    return this._precision.get();
  }

  public setInput = (input: string) => {
    console.log(`setInput(${input})`);
    this._input.set(input);
    if (input === "") {
      this.setValue(undefined);
    } else {
      // TODO handle K, M etc
      const v = this.precision === 0 ? parseInt(input, 0) : parseFloat(input);
      if (!isNaN(v)) {
        this.setValue(v);
      }
    }
  };

  public setValue = (value: number | undefined) => {
    this._value.set(value);
  };

  public setDisabled = (disabled: boolean) => {
    this._isDisabled.set(disabled);
  };

  public setPrecision = (precision: number) => {
    this._precision.set(precision);
  };

  public setFocused = (focused: boolean) => {
    if (focused === this.isFocused) {
      return;
    }
    if (focused) {
      this._input.set(this.text);
    } else {
      this._input.set("");
    }
    this._isFocused.set(focused);
  };
}
