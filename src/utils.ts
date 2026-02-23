export function getTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function getFaviconFileName(time: string) {
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = time.split(":").map(Number);

  if (hours >= 12) {
    hours -= 12;
  }

  return `${hours.toString().padStart(2, "0")}_${minutes >= 0 && minutes < 30 ? "00" : "30"}`;
}

export function updateFavicon() {
  const time = getTime();

  if (time.includes(":00") || time.includes(":30")) {
    return;
  }
  
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = `/favicon/${getFaviconFileName(time)}.ico`;
  document.head.appendChild(link);
}
