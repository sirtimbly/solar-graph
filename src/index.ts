import SunCalc from "suncalc";
import { throttle } from "lodash-es"
import { addDays, addHours, addMinutes, differenceInMinutes, startOfDay, startOfToday } from "date-fns";
const canvas: HTMLCanvasElement | null = document.querySelector("#graph");
// console.log("🚀 ~ canvas:", canvas)

function getColorFromGradient(percentage: number, colorStops: Array<{ color: number[]; position: number }>) {
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (percentage >= colorStops[i].position && percentage <= colorStops[i + 1].position) {
      const ratio = (percentage - colorStops[i].position) / (colorStops[i + 1].position - colorStops[i].position);
      const r = Math.round(colorStops[i].color[0] + (colorStops[i + 1].color[0] - colorStops[i].color[0]) * ratio);
      const g = Math.round(colorStops[i].color[1] + (colorStops[i + 1].color[1] - colorStops[i].color[1]) * ratio);
      const b = Math.round(colorStops[i].color[2] + (colorStops[i + 1].color[2] - colorStops[i].color[2]) * ratio);
      return `${r}, ${g}, ${b}`;
    }
  }
}

function positionFromDateTime(date: Date) {
  return (differenceInMinutes(date, startOfDay(date)) / 1440) * 100;
}





let minuteOffset = 0;
let dayOffset = 0
drawGraph(minuteOffset, dayOffset);

window.addEventListener("wheel", throttle((event) => {
  if (event.deltaY) {
    console.log("🚀 ~ window.addEventListener ~ event:", event);
    minuteOffset += event.deltaY;
    drawGraph(minuteOffset, dayOffset);
  }
}, 12))

window.addEventListener("keydown", throttle((event) => {
  if (event.code === "ArrowRight") {
    dayOffset++;
  }
  if (event.code === "ArrowLeft") {
    dayOffset--;
  }
  if (event.code === "ArrowUp") {
    dayOffset += 30;
  }
  if (event.code === "ArrowDown") {
    dayOffset -= 30;
  }
  drawGraph(minuteOffset, dayOffset);
}, 20))

function drawGraph(minutes: number, days: number) {
  if (canvas) {
    const ctx = canvas.getContext("2d");
    // console.log("🚀 ~ ctx:", ctx)

    const dimensions = canvas.getBoundingClientRect();
    // console.log("🚀 ~ dimensions:", dimensions)
    if (ctx && dimensions) {
      ctx.reset();
      const midX = dimensions.width / 2;
      const midY = dimensions.height / 2
      const currentTime = addDays(addMinutes(new Date(), minutes), days);
      ctx.fillStyle = "rgba(244,244,244,1)"

      ctx.fillText(currentTime.toString(), 10, 10)
      // const currentTime = addMinutes(startOfToday(), 30);
      const lat = 39.1;
      const lon = -104.9;
      const position = SunCalc.getPosition(currentTime, lat, lon);
      console.log("🚀 ~ position:", position)
      const times = SunCalc.getTimes(currentTime, lat, lon);
      console.log("🚀 ~ times:", times)
      /**
       * nauticalDawn: Date Tue Apr 30 2024 04:59:21 G)
       * dawn: Date Tue Apr 30 2024 05:34:20 e)
       * sunrise: Date Tue Apr 30 2024 06:03:10 GMT-06
       * sunriseEnd: Date Tue Apr 30 2024 06:06:05 GMT
       * solarNoon: Date Tue Apr 30 2024 12:57:56 GMT-
       * goldenHour: Date Tue Apr 30 2024 19:15:49 GMT
       * sunsetStart: Date Tue Apr 30 2024 19:49:48 GM
       * dusk: Date Tue Apr 30 2024 20:21:33 GMT-0600
       * sunset: Date Tue Apr 30 2024 19:52:43 GMT-060
       * nauticalDusk: Date Tue Apr 30 2024 20:56:32 G)
       * night: Date Tue Apr 30 2024 21:34:00 GMT-0600
​
       */
      const colorStops = [
        { color: [50, 4, 73], position: 0 },
        { color: [121, 9, 118], position: positionFromDateTime(times.nauticalDawn) },
        // { color: [167, 56, 34], position: positionFromDateTime(times.dawn) },
        // { color: [208, 119, 41], position: positionFromDateTime(times.sunrise) },
        { color: [255, 215, 79], position: positionFromDateTime(times.dawn) },
        { color: [253, 255, 183], position: positionFromDateTime(times.sunrise) },
        { color: [174, 255, 254], position: positionFromDateTime(times.sunriseEnd) },
        { color: [225, 253, 255], position: positionFromDateTime(times.solarNoon) },
        // { color: [130, 236, 255], position: 63 },
        { color: [62, 123, 201], position: positionFromDateTime(times.goldenHour) },
        { color: [201, 122, 17], position: positionFromDateTime(times.sunsetStart) },
        { color: [201, 81, 17], position: positionFromDateTime(times.dusk) },
        { color: [43, 20, 126], position: positionFromDateTime(times.nauticalDusk) },
        { color: [23, 6, 61], position: positionFromDateTime(times.night) }
      ];
      // console.log("🚀 ~ drawGraph ~ colorStops:", colorStops)
      // Sun Arc
      const pxYPerRadian = dimensions.height / Math.PI;
      // console.log("🚀 ~ pxYPerRadian:", pxYPerRadian);

      const noonAlt = midY - SunCalc.getPosition(times.solarNoon, lat, lon).altitude * pxYPerRadian;
      // console.log("🚀 ~ noonAlt:", noonAlt)
      const arcTop = noonAlt
      // console.log("🚀 ~ arcTop:", arcTop)
      const midnightAlt = midY - SunCalc.getPosition(times.nadir, lat, lon).altitude * pxYPerRadian
      // console.log("🚀 ~ midnightAlt:", midnightAlt)
      const arcBottom = midnightAlt;
      // console.log("🚀 ~ arcBottom:", arcBottom)
      ctx.lineWidth = 2;
      // ctx.beginPath();
      // ctx.strokeStyle = 'rgba(114, 173, 231, 1)';
      // ctx.moveTo(0, midnightAlt);
      // const controlDist = dimensions.width / 4;

      // ctx.bezierCurveTo(
      //   0, midnightAlt,
      //   midX, arcTop,
      //   midX, arcTop
      // );
      // ctx.bezierCurveTo(
      //   midX, arcTop,
      //   dimensions.width, midnightAlt,
      //   dimensions.width, midnightAlt
      // );
      // ctx.stroke();

      //middle
      // ctx.beginPath();
      // ctx.strokeStyle = "rgba(200, 200, 200, 1.000)";
      // ctx.moveTo(0, midY);
      // ctx.lineTo(dimensions.width, midY);
      // ctx.stroke();

      //Horizon'
      //const horizonY = dimensions.height / 2; //use ratio from suncalc for this time of year
      const dawnAlt = SunCalc.getPosition(times.dawn, lat, lon).altitude * pxYPerRadian
      console.log("🚀 ~ dawnAlt:", dawnAlt)
      const horizonY = midY - dawnAlt
      console.log("🚀 ~ horizonY:", horizonY)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(188, 144, 44, 1.000)";
      ctx.moveTo(0, horizonY);
      ctx.lineTo(dimensions.width, horizonY);
      ctx.stroke();


      //Path in sky
      const pxXPerHour = dimensions.width / 1440;
      for (let i = 0; i < 1440; i++) {
        const hourAlt = SunCalc.getPosition(addMinutes(startOfDay(currentTime), i), lat, lon).altitude * pxYPerRadian

        ctx.fillStyle = "rgba(147, 192, 237, 0.500)";
        ctx.strokeStyle = "transparent"
        ctx.beginPath();
        ctx.ellipse(pxXPerHour * i, midY - hourAlt, 1, 1, 0, 0, Math.PI * 2);
        ctx.fill()

      }
      //Sun Dot

      const sunY = midY - position.altitude * pxYPerRadian;
      console.log("🚀 ~ sunY:", sunY)

      const currentMinutes = (currentTime.getTime() - startOfDay(currentTime).getTime()) / 1000 / 60
      console.log("🚀 ~ currentMinutes:", currentMinutes)
      const sunX = (dimensions.width / 1440) * currentMinutes;
      console.log("🚀 ~ sunX:", sunX)
      ctx.fillStyle = "rgba(255, 240, 237, 1.000)";
      ctx.beginPath();
      ctx.ellipse(sunX, sunY, 10, 10, 0, 0, Math.PI * 2);
      ctx.fill()

      //Glow Gradient Box
      const gradient = ctx.createRadialGradient(sunX, sunY, 13, sunX, sunY, dimensions.height / 2);


      const startColor = getColorFromGradient(sunX / dimensions.width * 100, colorStops);
      console.log("🚀 ~ drawGraph ~ startColor:", startColor)

      gradient.addColorStop(0, `rgba(${startColor}, 0.22)`);

      gradient.addColorStop(1, `rgba(${startColor}, 0.000)`);
      // gradient.addColorStop(1, "rgba(255, 240, 237, 0.000)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, horizonY);


    }

  }


}
