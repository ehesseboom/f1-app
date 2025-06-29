import dayjs from "https://esm.sh/dayjs";
import utc from "https://esm.sh/dayjs/plugin/utc";
import timezone from "https://esm.sh/dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const raceName = document.getElementById("race-name");
const sessions = ["fp1", "fp2", "fp3", "sprQ", "sprint", "qualy", "race"];
const circuitName = document.getElementById("circuit-name");
const lapRecordTime = document.getElementById("lap-record-time");
const lapRecordDriver = document.getElementById("lap-record-driver");
const lapRecordYear = document.getElementById("lap-record-year");
const errorMessage = document.getElementById("error-message");

const driversStandings = document.getElementById("drivers-standings");
const constructorsStandings = document.getElementById("constructors-standings");

async function getData() {
  try {
    const response = await fetch("https://f1api.dev/api/current/next");
    const data = await response.json();
    // console.log(data);
    const standingsResponse = await fetch(
      "https://f1api.dev/api/current/drivers-championship"
    );
    const standingsData = await standingsResponse.json();
    console.log(standingsData);
    const conStandingsResponse = await fetch(
      "https://f1api.dev/api/current/constructors-championship"
    );
    const conStandingsData = await conStandingsResponse.json();
    console.log(conStandingsData);

    if (!response.ok) {
      errorMessage.style.display = "flex";
      throw new Error(
        `Failed to fetch race data: ${response.status} ${response.statusText}`
      );
    }

    // CURRENT GP TITLE -----------------------
    const dataRaceName = data.race[0].raceName;
    raceName.textContent = dataRaceName;

    // Schedule date & time upcoming GP
    const schedule = data.race[0].schedule;
    // console.log(schedule);

    // Loop through all sessions and do something for each of them
    sessions.forEach((session) => {
      // Check if session has no data
      if (!schedule[session]) {
        document.getElementById(session).style.display = "none";
        return;
      }

      // CURRENT GP TIMES & DATES -------------------
      const sessionData = schedule[session];
      // console.log(sessionData);

      const month = dayjs(sessionData.date).format("MMM");
      const day = dayjs(sessionData.date).format("DD");
      const dateTimeUTC = `${sessionData.date}T${sessionData.time}`;
      const time = dayjs.utc(dateTimeUTC).tz("Europe/Berlin").format("HH:mm");

      document.getElementById(`${session}-month`).textContent = month;
      document.getElementById(`${session}-day`).textContent = day;
      document.getElementById(`${session}-time`).textContent = time;

      // LAP RECORD CURRENT GP -----------------
      const dataCircuitName = data.race[0].circuit.circuitName;
      circuitName.textContent = dataCircuitName;

      const dataLapRecordTime = data.race[0].circuit.lapRecord;
      lapRecordTime.textContent = dataLapRecordTime;

      const dataLapRecordDriver = data.race[0].circuit.fastestLapDriverId;
      lapRecordDriver.textContent =
        dataLapRecordDriver.charAt(0).toUpperCase() +
        dataLapRecordDriver.slice(1);

      const dataLapRecordYear = data.race[0].circuit.fastestLapYear;
      lapRecordYear.textContent = dataLapRecordYear;

      // SEASON STANDINGS TITLE YEAR-------------------------
      const titleYear = document.getElementById("title-year");
      const year = standingsData.season;
      titleYear.textContent = year;

      // DRIVERS STANDINGS ------------------------------
      const dataDriversStandings = standingsData.drivers_championship;
      driversStandings.innerHTML = "";
      dataDriversStandings.forEach((driver) => {
        if (driver.driver.surname === "Doohan") {
          return;
        }

        const card = document.createElement("div");
        card.classList.add("driver-card");

        const position = document.createElement("span");
        position.textContent = driver.position + ".";
        position.classList.add("position");
        card.append(position);

        const wrapperName = document.createElement("div");
        wrapperName.classList.add("wrapper-name");
        card.append(wrapperName);

        const firstName = document.createElement("span");
        firstName.textContent = driver.driver.name;
        firstName.classList.add("first-name");
        wrapperName.append(firstName);

        const lastName = document.createElement("span");
        lastName.textContent = driver.driver.surname;
        lastName.classList.add("last-name");
        wrapperName.append(lastName);

        const team = document.createElement("span");
        team.textContent = driver.team.teamName;
        team.classList.add("team");
        card.append(team);

        const points = document.createElement("span");
        points.textContent = driver.points;
        points.classList.add("points");
        card.append(points);

        driversStandings.appendChild(card);
      });

      // CONSTRUCTORS STANDINGS
      const dataConstructorsStandings =
        conStandingsData.constructors_championship;
      constructorsStandings.innerHTML = "";
      dataConstructorsStandings.forEach((constructor) => {
        const conCard = document.createElement("div");
        conCard.classList.add("constructor-card");

        const position = document.createElement("span");
        position.textContent = constructor.position + ".";
        position.classList.add("position");
        conCard.append(position);

        const team = document.createElement("span");
        team.textContent = constructor.team.teamName;
        team.classList.add("team");
        conCard.append(team);

        const points = document.createElement("span");
        points.textContent = constructor.points;
        points.classList.add("points");
        conCard.append(points);

        constructorsStandings.appendChild(conCard);
      });
    });
  } catch (error) {
    console.error("An error occurred while fetching F1 data:", error.message);
    errorMessage.style.display = "flex";
  }
}

getData();

const page = document.querySelectorAll(".page");
const btnPage = document.querySelectorAll(".btn-page");
const btnStandings = btnPage[0];
const btnCurrentGp = btnPage[1];
const pageCurrentGp = page[0];
const pageStandings = page[1];

btnStandings.addEventListener("click", () => {
  pageCurrentGp.classList.remove("active");
  pageStandings.classList.add("active");
  btnStandings.classList.remove("active"); // Keep btnStandings visible
  btnCurrentGp.classList.add("active"); // Hide or de-emphasize btnCurrentGp
});

btnCurrentGp.addEventListener("click", () => {
  pageCurrentGp.classList.add("active");
  pageStandings.classList.remove("active");
  btnStandings.classList.add("active"); // Hide or de-emphasize btnStandings
  btnCurrentGp.classList.remove("active"); // Keep btnCurrentGp visible
});

const swipeField = document.getElementById("swipe-field");
let startX = 0;
let endX = 0;
let currentView = "drivers";

swipeField.addEventListener("touchstart", (event) => {
  startX = event.changedTouches[0].clientX;
});
swipeField.addEventListener("touchend", (event) => {
  endX = event.changedTouches[0].clientX;

  if (endX - startX > 50 && currentView === "constructors") {
    // shows drivers
    currentView = "drivers";
    showStandings(currentView);
  } else if (endX - startX < -50 && currentView === "drivers") {
    // shows constructors
    currentView = "constructors";
    showStandings(currentView);
  }
});

const titleStandings = document.querySelectorAll(".title-stand");
const titleDrivers = titleStandings[0];
const titleConstructors = titleStandings[1];
const dots = document.querySelectorAll(".dot");
const firstDot = dots[0];
const secondDot = dots[1];

function showStandings(view) {
  driversStandings.classList.remove("active");
  constructorsStandings.classList.remove("active");
  swipeField.scrollTo(0, 0);

  if (view === "drivers") {
    driversStandings.classList.add("active");
    titleDrivers.classList.add("active");
    titleConstructors.classList.remove("active");
    firstDot.classList.add("active");
    secondDot.classList.remove("active");
    swipeField.style.overflowY = "scroll";
  } else if (view === "constructors") {
    constructorsStandings.classList.add("active");
    titleDrivers.classList.remove("active");
    titleConstructors.classList.add("active");
    firstDot.classList.remove("active");
    secondDot.classList.add("active");
    swipeField.style.overflowY = "hidden";
  }
}

// APP
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then(() => console.log("Service Worker Registered"));
}
