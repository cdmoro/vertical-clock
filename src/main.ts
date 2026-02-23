import "./style.css";
import { updateFavicon } from "./utils";

let FORMAT = 24;
const formatEl = document.querySelector<HTMLDivElement>(".clock .format")!;
const formats = document.querySelectorAll<HTMLSpanElement>(
  ".clock .format > span",
)!;
const toggleFormatBtn =
  document.querySelector<HTMLButtonElement>("#toggle-format")!;
const toggleThemeBtn = document.querySelector<HTMLButtonElement>("#theme-btn")!;
const variantSelectEl =
  document.querySelector<HTMLSelectElement>("#variant-select")!;
const resetColorBtn =
  document.querySelector<HTMLButtonElement>("#reset-color")!;
const colorPickerEl =
  document.querySelector<HTMLInputElement>("#color-picker")!;
const digits = [...document.querySelectorAll<HTMLDivElement>(".clock .digit")];
let forceUpdatePhoto = false;

const numbersCache = digits.map((d) => [
  ...d.querySelectorAll<HTMLSpanElement>(":scope > span"),
]);
let prevTime: number[] | null = null;
let prevPeriod: number | null = null;

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const THEME_COLORS = {
  default: "#ffaacc",
  cards: "#444cf7",
  cogs: "#808080",
  cylinder: "#d72d71",
  memories: "#ffffff",
  caterpillars: "#698744",
  photo: "#fd3622",
};

function startTime() {
  const today = new Date();
  let h = today.getHours();

  if (FORMAT === 12) {
    const period = h >= 12 ? 1 : 0;

    if (prevPeriod !== period) {
      formats.forEach((n) => n.classList.remove("active"));
      formats[period].classList.add("active");

      formatEl.style.transform = `translatey(calc(var(--clock-height) * -${period} + 1px))`;
      formatEl.style.setProperty(
        "--factor",
        ((Math.random() - 0.5) * 2).toFixed(2),
      );

      let formatPos = period * -1;

      formats.forEach((f) => {
        f.style.setProperty("--pos", formatPos.toString());
        f.style.setProperty(
          "--n-factor",
          ((Math.random() - 0.5) * 2).toFixed(2),
        );
        f.dataset.pos = formatPos.toString();
        formatPos++;
      });

      prevPeriod = period;
    }

    h = h % 12 || 12;
  }

  const newTime = [
    Math.floor(h / 10),
    h % 10,
    Math.floor(today.getMinutes() / 10),
    today.getMinutes() % 10,
    Math.floor(today.getSeconds() / 10),
    today.getSeconds() % 10,
  ];

  const periodStr = FORMAT === 12 ? (prevPeriod === 0 ? " am" : " pm") : "";
  const isNewMinute = prevTime?.[3] !== newTime[3];

  if (isNewMinute) {
    updateFavicon();
  }

  if (
    variantSelectEl.value === "photo" &&
    (isNewMinute || forceUpdatePhoto)
  ) {
    document.documentElement.style.setProperty(
      "--background-image",
      `url("https://picsum.photos/seed/${newTime.join("")}${periodStr.trim()}/1294/965")`,
    );
    forceUpdatePhoto = false;
  } else if (variantSelectEl.value !== "photo") {
    document.documentElement.style.removeProperty("--background-image");
  }

  document.title = `${newTime[0]}${newTime[1]}:${newTime[2]}${newTime[3]}${periodStr} - Vertical Clock`;

  newTime.forEach((d, i) => {
    if (!prevTime || prevTime[i] !== d) {
      digits[i].style.transform =
        `translatey(calc(var(--clock-height) * -${d} + 1px))`;
      digits[i].style.setProperty(
        "--factor",
        ((Math.random() - 0.5) * 2).toFixed(2),
      );

      if (prevTime) {
        numbersCache[i][prevTime[i]].classList.remove("active");
      }

      numbersCache[i][d].classList.add("active");

      let pos = d * -1;

      numbersCache[i].forEach((num) => {
        num.style.setProperty("--pos", pos.toString());
        // num.style.setProperty("--n-factor", ((Math.random() - 0.5) * 2).toFixed(2));
        num.dataset.pos = pos.toString();
        pos++;
      });
    }
  });

  prevTime = newTime;
}

function setFormat(newFormat: string) {
  FORMAT = parseInt(newFormat);
  prevPeriod = null;
  document.documentElement.dataset.format = newFormat;
  toggleFormatBtn.innerText = FORMAT === 12 ? "24" : "12";
  toggleFormatBtn.title = `Switch to ${FORMAT === 12 ? "24" : "12"}-hour format`;
  localStorage.setItem("format", newFormat);
}

function setMemories() {
  document
    .querySelectorAll<HTMLSpanElement>(".col > span > span")
    .forEach((el) =>
      el.style.setProperty(
        "--photo",
        `url("https://picsum.photos/id/${randomIntFromInterval(1, 600)}/50")`,
      ),
    );
}

function setTheme(newTheme: string) {
  toggleThemeBtn.innerText = `${newTheme === "light" ? "Dark" : "Light"}`;
  document.documentElement.dataset.theme = newTheme;
  localStorage.setItem("theme", newTheme);
}

function setVariant(newVariant: string) {
  document.documentElement.dataset.variant = newVariant;
  variantSelectEl.value = newVariant;
  localStorage.setItem("variant", newVariant);

  const color = THEME_COLORS[newVariant as keyof typeof THEME_COLORS];

  if (color) {
    setColor(color);
  }

  if (newVariant === "memories") {
    setMemories();
  }

  if (newVariant === "photo") {
    forceUpdatePhoto = true;
  }
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function getForegroundColor(color: string) {
  const rgb = hexToRgb(color)
    .split(",")
    .map((c) => parseInt(c.trim()));
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 125 ? "#333" : "#eee";
}

function setColor(newColor: string) {
  document.documentElement.style.setProperty(
    "--accent-color-rgb",
    hexToRgb(newColor),
  );
  document.documentElement.style.setProperty(
    "--foreground-accent-color",
    getForegroundColor(newColor),
  );
  colorPickerEl.value = newColor;
  localStorage.setItem("color", newColor);

  if (
    colorPickerEl.value !==
    THEME_COLORS[variantSelectEl.value as keyof typeof THEME_COLORS]
  ) {
    colorPickerEl.classList.remove("single");
    resetColorBtn.style.display = "inline-block";
  } else {
    colorPickerEl.classList.add("single");
    resetColorBtn.style.display = "none";
  }
}

function main() {
  const savedFormat = localStorage.getItem("format") || "24";
  const savedTheme = localStorage.getItem("theme") || "light";
  const savedVariant = localStorage.getItem("variant") || "default";
  const savedColor = localStorage.getItem("color") || "#ffaacc";

  setFormat(savedFormat);
  setTheme(savedTheme);
  setVariant(savedVariant);
  setColor(savedColor);

  numbersCache.forEach((digit) => {
    digit.forEach((num) => {
      num.style.setProperty(
        "--n-factor",
        ((Math.random() - 0.5) * 2).toFixed(2),
      );
    });
  });

  startTime();
  setInterval(startTime, 1000);

  toggleThemeBtn.addEventListener("click", () => {
    const newTheme =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });

  toggleFormatBtn.addEventListener("click", () => {
    const newFormat =
      document.documentElement.dataset.format === "12" ? "24" : "12";

    formats.forEach((n) => n.classList.remove("active"));
    formatEl.style.transform = `translatey(0px)`;

    setFormat(newFormat);
  });

  resetColorBtn.addEventListener("click", () => {
    const theme = document.documentElement.dataset.variant || "default";
    if (theme in THEME_COLORS) {
      setColor(THEME_COLORS[theme as keyof typeof THEME_COLORS]);
    }
  });

  variantSelectEl.addEventListener("input", (e) =>
    setVariant((e.target as HTMLSelectElement).value),
  );

  colorPickerEl.addEventListener("input", (e) => {
    setColor((e.target as HTMLInputElement).value);
  });
}

document.addEventListener("DOMContentLoaded", main);
