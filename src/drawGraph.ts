import * as sunCalc from "suncalc";
import { addDays, addMinutes, differenceInMinutes, startOfDay } from "date-fns";

const getColorFromGradient = (
  percentage: number,
  colorStops: { color: number[]; position: number }[],
) => {
  for (const stop of colorStops) {
    const nextStop = colorStops.find((x) => x.position > stop.position);

    if (!nextStop) {
      return `${stop.color[0].toFixed(0)}, ${stop.color[1].toFixed(
        0,
      )}, ${stop.color[2].toFixed(0)}`;
    }

    if (percentage >= stop.position && percentage <= nextStop.position) {
      const ratio =
        (percentage - stop.position) / (nextStop.position - stop.position);
      const r = Math.round(
        stop.color[0] + (nextStop.color[0] - stop.color[0]) * ratio,
      ).toFixed(0);
      const g = Math.round(
        stop.color[1] + (nextStop.color[1] - stop.color[1]) * ratio,
      ).toFixed(0);
      const b = Math.round(
        stop.color[2] + (nextStop.color[2] - stop.color[2]) * ratio,
      ).toFixed(0);

      return `${r}, ${g}, ${b}`;
    }
  }
};

const positionFromDateTime = (date: Date) =>
  (differenceInMinutes(date, startOfDay(date)) / 1440) * 100;

export const drawGraph = (options: {
  canvas: HTMLCanvasElement;
  location: { lat: number; lon: number; altitudeMASL?: number };
  date?: Date;
  offset?: { minutes: number; days: number };
}): void => {
  if (options.canvas.hidden || !options.location.lat || !options.location.lon) {
    return;
  }
  const mergedOpts = {
    offset: {
      minutes: 0,
      days: 0,
    },
    date: new Date(),
    ...options,
  };

  if (!options.date) {
    mergedOpts.date = new Date(); //now
  }

  const ctx = options.canvas.getContext("2d");
  const dimensions = options.canvas.getBoundingClientRect();

  if (!ctx) {
    return;
  }

  ctx.reset();

  const midY = dimensions.height / 2;
  const currentTime = addDays(
    addMinutes(mergedOpts.date, mergedOpts.offset.minutes),
    mergedOpts.offset.days,
  );

  ctx.fillStyle = "rgba(244,244,244,1)";

  const { lat, lon } = mergedOpts.location;
  const position = sunCalc.getPosition(currentTime, lat, lon);
  const times = sunCalc.getTimes(currentTime, lat, lon);
  // Example Timestamps:
  // * nauticalDawn: Date Tue Apr 30 2024 04:59:21 G)
  // * dawn: Date Tue Apr 30 2024 05:34:20 e)
  // * sunrise: Date Tue Apr 30 2024 06:03:10 GMT-06
  // * sunriseEnd: Date Tue Apr 30 2024 06:06:05 GMT
  // * solarNoon: Date Tue Apr 30 2024 12:57:56 GMT-
  // * goldenHour: Date Tue Apr 30 2024 19:15:49 GMT
  // * sunsetStart: Date Tue Apr 30 2024 19:49:48 GM
  // * dusk: Date Tue Apr 30 2024 20:21:33 GMT-0600
  // * sunset: Date Tue Apr 30 2024 19:52:43 GMT-060
  // * nauticalDusk: Date Tue Apr 30 2024 20:56:32 G)
  // * night: Date Tue Apr 30 2024 21:34:00 GMT-0600
  //
  const colorStops = [
    { color: [50, 4, 73], position: 0 },
    {
      color: [121, 9, 118],
      position: positionFromDateTime(times.nauticalDawn),
    },
    { color: [255, 215, 79], position: positionFromDateTime(times.dawn) },
    {
      color: [253, 255, 183],
      position: positionFromDateTime(times.sunrise),
    },
    {
      color: [174, 255, 254],
      position: positionFromDateTime(times.sunriseEnd),
    },
    {
      color: [225, 253, 255],
      position: positionFromDateTime(times.solarNoon),
    },
    {
      color: [62, 123, 201],
      position: positionFromDateTime(times.goldenHour),
    },
    {
      color: [201, 122, 17],
      position: positionFromDateTime(times.sunsetStart),
    },
    { color: [201, 81, 17], position: positionFromDateTime(times.dusk) },
    {
      color: [43, 20, 126],
      position: positionFromDateTime(times.nauticalDusk),
    },
    { color: [23, 6, 61], position: positionFromDateTime(times.night) },
  ];

  // Sun Arc
  const pxYPerRadian = dimensions.height / Math.PI;
  console.log("🚀 ~ pxYPerRadian:", pxYPerRadian);

  // const noonAlt =
  //   midY -
  //   sunCalc.getPosition(times.solarNoon, lat, lon).altitude * pxYPerRadian;

  // const midnightAlt =
  //   midY - sunCalc.getPosition(times.nadir, lat, lon).altitude * pxYPerRadian;

  // // console.log("🚀 ~ midnightAlt:", midnightAlt)

  ctx.lineWidth = 2;

  //Horizon line
  //const horizonY = dimensions.height / 2; //use ratio from sunCalc for this time of year
  const dawnAlt =
    sunCalc.getPosition(times.dawn, lat, lon).altitude * pxYPerRadian;

  const horizonY = midY - dawnAlt;

  ctx.beginPath();
  ctx.strokeStyle = "rgba(188, 144, 44, 1.000)";
  ctx.moveTo(0, horizonY);
  ctx.lineTo(dimensions.width, horizonY);
  ctx.stroke();

  //Path in sky
  const horizontalSteps = Math.min(dimensions.width, 1440);
  console.log("🚀 ~ horizontalSteps:", horizontalSteps);
  const xPixelsPerMinute = 1440 / horizontalSteps;
  console.log("🚀 ~ xPixelsPerMinute:", xPixelsPerMinute);

  //DRAW THE PATH WITH SUN DOTS
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < horizontalSteps; i++) {
    const sunDotAltitude = sunCalc.getPosition(
      addMinutes(startOfDay(currentTime), i * xPixelsPerMinute),
      lat,
      lon,
    ).altitude;
    // console.log("🚀 ~ sunDotAltitude:", sunDotAltitude);

    ctx.fillStyle = "rgba(147, 192, 237, 0.500)";
    ctx.strokeStyle = "transparent";
    ctx.beginPath();
    ctx.ellipse(
      i,
      midY - sunDotAltitude * pxYPerRadian,
      1,
      1,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  //Sun Dot

  const sunY = midY - position.altitude * pxYPerRadian;
  console.log("🚀 ~ sunY:", sunY);

  const currentMinutes =
    (currentTime.getTime() - startOfDay(currentTime).getTime()) / 1000 / 60;

  console.log("🚀 ~ currentMinutes:", currentMinutes);
  const sunX = currentMinutes / xPixelsPerMinute;
  console.log("🚀 ~ sunX:", sunX);

  ctx.fillStyle = "rgba(255, 240, 237, 1.000)";
  ctx.beginPath();
  ctx.ellipse(sunX, sunY, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  //Glow Gradient Box
  const gradient = ctx.createRadialGradient(
    sunX,
    sunY,
    13,
    sunX,
    sunY,
    dimensions.height / 2,
  );

  const startColor =
    getColorFromGradient((sunX / dimensions.width) * 100, colorStops) ??
    "200, 200, 255";

  gradient.addColorStop(0, `rgba(${startColor}, 0.22)`);
  gradient.addColorStop(1, `rgba(${startColor}, 0.000)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, dimensions.width, horizonY);
};
