import { throttle } from "lodash-es";
import { drawGraph } from "./drawGraph";

const ui = document.querySelector("#solar-widget");

if (ui) {
  let elem: HTMLCanvasElement | null = document.querySelector(
    "#solar-widget [data-ui='graph']",
  );

  if (!elem) {
    const newCanvas = document.createElement("canvas");

    newCanvas.setAttribute("width", "100%");
    newCanvas.setAttribute("height", "100%");

    document
      .querySelector("body")
      ?.insertAdjacentElement("afterbegin", newCanvas);
    elem = newCanvas;
  }

  const defaultConfig = {
    canvas: elem,
    location: {
      lat: 39,
      lon: -104,
    },
  };

  let minuteOffset = 0;
  let dayOffset = 0;

  const drawCurrentState = () => {
    elem.width = ui.clientWidth;
    elem.height = ui.clientHeight;

    drawGraph({
      ...defaultConfig,
      offset: { minutes: minuteOffset, days: dayOffset },
    });
  };

  window.addEventListener(
    "wheel",
    throttle((event: WheelEvent) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      if (!event.deltaY) {
        return;
      }
      minuteOffset = minuteOffset + event.deltaY;
      drawCurrentState();
    }, 12),
  );

  window.addEventListener(
    "keydown",
    throttle((event: KeyboardEvent) => {
      if (event.code === "ArrowRight") {
        dayOffset = dayOffset + 1;
      }
      if (event.code === "ArrowLeft") {
        dayOffset = dayOffset - 1;
      }
      if (event.code === "ArrowUp") {
        dayOffset = dayOffset + 30;
      }
      if (event.code === "ArrowDown") {
        dayOffset = dayOffset - 30;
      }
      if (event.code === "Enter") {
        dayOffset = 0;
        minuteOffset = 0;
      }
      drawCurrentState();
    }, 20),
  );

  window.addEventListener("resize", drawCurrentState);
  drawCurrentState();

  window.setInterval(drawCurrentState, 1000 * 60);
}
