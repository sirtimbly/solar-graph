import { isString } from "lodash-es";

import { h } from "preact";

export type UIStateObject = Readonly<{
  currentDateTime: Date;
  dayOffset: number;
  minuteOffset: number;
}>;
export interface UIActions {
  setDate: (newDate: Date) => void;
}

export const ui = h("div", { className: "bg-gray p1" }, ["hello"]);
