import "./style.css";
import { updateFavicon } from "./utils";

let FORMAT = 24;
const formatEl = document.querySelector<HTMLDivElement>(".clock .format")!;
const formats = document.querySelectorAll<HTMLSpanElement>(
  ".clock .format > span",
)!;
const toggleFormatBtn =
  document.querySelector<HTMLButtonElement>("#toggle-format")!;
const themeSelectEl = document.querySelector<HTMLSelectElement>("#theme-select")!;
const variantSelectEl =
  document.querySelector<HTMLSelectElement>("#variant-select")!;
const resetColorBtn =
  document.querySelector<HTMLButtonElement>("#reset-color")!;
const colorPickerEl =
  document.querySelector<HTMLInputElement>("#color-picker")!;
const languageSelectEl =
  document.querySelector<HTMLSelectElement>("#language-select")!;
const digits = [...document.querySelectorAll<HTMLDivElement>(".clock .digit")];
let forceUpdatePhoto = false;

const numbersCache = digits.map((d) => [
  ...d.querySelectorAll<HTMLSpanElement>(":scope > span"),
]);
let prevTime: number[] | null = null;
let prevPeriod: number | null = null;
const RTL_LOCALES = ["ar"];
let mouseTimeout: number | undefined;

type Language = "en" | "es" | "it" | "fr" | "pt" | "de" | "ch" | "gr" | "ar";

type NumberToWords = {
  [key in Language]: Record<string, string>;
};

type Theme = "light" | "dark" | "auto";

const TRANSLATIONS: NumberToWords = {
  en: {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    am: "am",
    pm: "pm",
    auto: "Auto",
    light: "Light",
    dark: "Dark",
    default: "Default",
    cards: "Cards",
    cogs: "Cogs",
    cylinder: "Cylinder",
    memories: "Memories",
    caterpillars: "Caterpillars",
    photo: "Photo",
    words: "Words",
    reset: "Reset",
    made_by: "Made by"
  },
  es: {
    0: "cero",
    1: "uno",
    2: "dos",
    3: "tres",
    4: "cuatro",
    5: "cinco",
    6: "seis",
    7: "siete",
    8: "ocho",
    9: "nueve",
    am: "am",
    pm: "pm",
    auto: "auto",
    light: "Claro",
    dark: "Oscuro",
    default: "Base",
    cards: "Tarjetas",
    cogs: "Engranajes",
    cylinder: "Cilindro",
    memories: "Recuerdos",
    caterpillars: "Orugas",
    photo: "Foto",
    words: "Palabras",
    reset: "Restablecer",
    made_by: "Hecho por"
  },
  it:  {
    0: "zero",
    1: "uno",
    2: "due",
    3: "tre",
    4: "quattro",
    5: "cinque",
    6: "sei",
    7: "sette",
    8: "otto",
    9: "nove",
    am: "am",
    pm: "pm",
    auto: "Auto",
    light: "Chiaro",
    dark: "Scuro",
    default: "Predefinito",
    cards: "Carte",
    cogs: "Ingranaggi",
    cylinder: "Cilindro",
    memories: "Ricordi",
    caterpillars: "Bruchi",
    photo: "Foto",
    words: "Parole",
    reset: "Reimposta",
    made_by: "Realizzato da"
  },
  fr: {
    0: "zéro",
    1: "un",
    2: "deux",
    3: "trois",
    4: "quatre",
    5: "cinq",
    6: "six",
    7: "sept",
    8: "huit",
    9: "neuf",
    am: "am",
    pm: "pm",
    auto: "Auto",
    light: "Clair",
    dark: "Sombre",
    default: "Par défaut",
    cards: "Cartes",
    cogs: "Engrenages",
    cylinder: "Cylindre",
    memories: "Souvenirs",
    caterpillars: "Chenilles",
    photo: "Photo",
    words: "Mots",
    reset: "Réinitialiser",
    made_by: "Fait par"
  },
  pt: {
    0: "zero",
    1: "um",
    2: "dois",
    3: "três",
    4: "quatro",
    5: "cinco",
    6: "seis",
    7: "sete",
    8: "oito",
    9: "nove",
    am: "am",
    pm: "pm",
    auto: "Auto",
    light: "Claro",
    dark: "Escuro",
    default: "Padrão",
    cards: "Cartas",
    cogs: "Engrenagens",
    cylinder: "Cilindro",
    memories: "Memórias",
    caterpillars: "Lagartas",
    photo: "Foto",
    words: "Palavras",
    reset: "Redefinir",
    made_by: "Feito por"
  },
  de: {
    0: "null",
    1: "eins",
    2: "zwei",
    3: "drei",
    4: "vier",
    5: "fünf",
    6: "sechs",
    7: "sieben",
    8: "acht",
    9: "neun",
    am: "am",
    pm: "pm",
    auto: "Auto",
    light: "Hell",
    dark: "Dunkel",
    default: "Standard",
    cards: "Karten",
    cogs: "Zahnräder",
    cylinder: "Zylinder",
    memories: "Erinnerungen",
    caterpillars: "Raupen",
    photo: "Foto",
    words: "Wörter",
    reset: "Zurücksetzen",
    made_by: "Hergestellt von"
  },
  ch: {
    0: "零",
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九",
    am: "上午",
    pm: "下午",
    auto: "自动",
    light: "明亮",
    dark: "暗",
    default: "默认",
    cards: "卡片",
    cogs: "齿轮",
    cylinder: "圆柱",
    memories: "回忆",
    caterpillars: "毛毛虫",
    photo: "照片",
    words: "文字",
    reset: "重置",
    made_by: "制作"
  },
  gr: {
    0: "μηδέν",
    1: "ένα",
    2: "δύο",
    3: "τρία",
    4: "τέσσερα",
    5: "πέντε",
    6: "έξι",
    7: "επτά",
    8: "οκτώ",
    9: "εννέα",
    am: "πμ",
    pm: "μμ",
    auto: "Αυτόματο",
    light: "Φως",
    dark: "Σκοτάδι",
    default: "Προεπιλογή",
    cards: "Κάρτες",
    cogs: "Γρανάζια",
    cylinder: "Κύλινδρος",
    memories: "Αναμνήσεις",
    caterpillars: "Προνύμφες",
    photo: "Φωτογραφία",
    words: "Λέξεις",
    reset: "Επαναφορά",
    made_by: "Κατασκευάστηκε από"
  },
  ar: {
    0: "صفر",
    1: "واحد",
    2: "اثنان",
    3: "ثلاثة",
    4: "أربعة",
    5: "خمسة",
    6: "ستة",
    7: "سبعة",
    8: "ثمانية",
    9: "تسعة",
    am: "ص",
    pm: "م",
    auto: "تلقائي",
    light: "فاتح",
    dark: "داكن",
    default: "افتراضي",
    cards: "بطاقات",
    cogs: "تروس",
    cylinder: "أسطوانة",
    memories: "ذكريات",
    caterpillars: "يرقات",
    photo: "صورة",
    words: "كلمات",
    reset: "إعادة تعيين",
    made_by: "صنع بواسطة"
  }
};

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
  words: "#e65719",
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

  if (variantSelectEl.value === "photo" && (isNewMinute || forceUpdatePhoto)) {
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

function setTheme(newTheme: Theme) {
  let theme = newTheme;

  if (newTheme === "auto") {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = isDarkMode ? "dark" : "light";
  }

  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", newTheme);
}

function setVariant(newVariant: string) {
  document.documentElement.dataset.variant = newVariant;
  variantSelectEl.value = newVariant;
  localStorage.setItem("variant", newVariant);

  const color = THEME_COLORS[newVariant as keyof typeof THEME_COLORS];

  if (color && Object.values(THEME_COLORS).includes(colorPickerEl.value)) {
    setColor(color);
  }

  if (newVariant === "memories") {
    setMemories();
  }

  if (newVariant === "photo") {
    forceUpdatePhoto = true;
  }

  setLocale(languageSelectEl.value as Language);
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

function setWords(locale: Language = "en") {
  document
    .querySelectorAll<HTMLSpanElement>(".col.digit > span > span")
    .forEach((n) => {
      n.dataset.word = TRANSLATIONS[locale][n.textContent];
    });
}

function setLocale(locale: Language) {
  document.documentElement.dataset.locale = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  document.querySelectorAll<HTMLElement>("[data-text]").forEach((el) => {
    const key = el.dataset.text;
    if (key && TRANSLATIONS[locale][key]) {
      el.textContent = TRANSLATIONS[locale][key];
    }
  });

  localStorage.setItem("locale", locale);
  setWords(locale);
}

function onMouseMove() {
  const footer = document.querySelector<HTMLElement>('footer');
  footer?.classList.remove('hidden');

  clearTimeout(mouseTimeout);

  mouseTimeout = window.setTimeout(() => {
    if (!footer?.matches(':hover')) {
      footer?.classList.add('hidden');
    }
  }, 3000);
}

function main() {
  const savedFormat = localStorage.getItem("format") || "24";
  const savedTheme = (localStorage.getItem("theme") || "auto") as Theme;
  const savedVariant = localStorage.getItem("variant") || "default";
  const savedColor = localStorage.getItem("color") || "#ffaacc";
  const savedLocale = (localStorage.getItem("locale") as Language) || "en";

  setFormat(savedFormat);
  setTheme(savedTheme);
  setVariant(savedVariant);
  setColor(savedColor);
  setLocale(savedLocale);

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

  themeSelectEl.value = savedTheme;
  languageSelectEl.value = savedLocale;

  document.addEventListener('mousemove', onMouseMove);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (themeSelectEl.value === "auto") {
      setTheme(e.matches ? "dark" : "light");
    }
  });

  themeSelectEl.addEventListener("input", (e) => {
    const newTheme = (e.target as HTMLSelectElement).value as Theme;
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

  languageSelectEl.addEventListener("input", (e) => {
    setLocale((e.target as HTMLSelectElement).value as Language);
  });
}

document.addEventListener("DOMContentLoaded", main);
