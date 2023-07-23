import { convertNumberToWords } from "./numberToWord.js";

const host = "http://localhost:3000";
const saveButton = document.getElementById("saveButton");
const infoTextarea = document.getElementById("infoTextarea");
const leftTableElement = document.getElementById("leftTable");
const rightTableElement = document.getElementById("rightTable");
const appointmentsAmountInfo = document.getElementById(
  "appointmentsAmountInfo",
);

const getItem = (text, color, id = undefined, withButton = false) => {
  const textColors = {
    red: "white",
    yellow: "black",
    green: "white",
  };

  console.log(id);
  return `<div class="item" style="background-color: ${color}; color: ${
    textColors[color]
  }">${text} 
        ${
          withButton
            ? `<button onclick='showInfo("${id}")'>Show Info</button>`
            : ""
        }
    </div>`;
};
let leftTable, rightTable;
window.showInfo = (id) => {
  const index = rightTable.findIndex((el) => el._id === id);
  console.log(rightTable[index]);
  const patient = rightTable[index].patientInfo;
  const hours = `${patient.hours[0]}-${
    patient.hours[patient.hours.length - 1]
  }`;
  infoTextarea.innerHTML = `Patient: ${patient.id}, ${hours}`;
  if (patient.name) infoTextarea.innerHTML += `, ${patient.name}`;
  if (patient.dob) infoTextarea.innerHTML += `, ${patient.dob}`;
  infoTextarea.innerHTML += `\nDoctor: ${rightTable[index].doctorId}\nAppointment:${rightTable[index].time}`;
};
function sortCallback(item1, item2) {
  if (item1.patientId !== item2.patientId)
    return item1.patientId - item2.patientId;
  if (item1.doctorId !== item2.doctorId) return item1.doctorId - item2.doctorId;
  return item1.time - item2.time;
}

const updateTables = async () => {
  rightTableElement.innerHTML = "";
  leftTableElement.innerHTML = "";
  const tables = await (await fetch(host + "/api")).json();
  tables.sort(sortCallback);
  [leftTable, rightTable] = tables;

  leftTableElement.addEventListener("scroll", () => {
    rightTableElement.scrollTop = leftTableElement.scrollTop;
  });
  rightTableElement.addEventListener("scroll", () => {
    leftTableElement.scrollTop = rightTableElement.scrollTop;
  });

  const counts = {
    green: 0,
    blue: 0,
    red: 0,
  };
  // leftTable.sort(sortCallback);
  rightTable.sort(sortCallback);
  leftTable.forEach((element) => {
    const { patientId, doctorId, time, color } = element;
    const text = `${patientId}, ${doctorId}` + (time ? `, ${time}` : "");
    leftTableElement.innerHTML += getItem(text, color);
  });
  rightTable.forEach((element) => {
    const { patientId, doctorId, time, color } = element;
    const text = `${patientId}, ${doctorId}` + (time ? `, ${time}` : "");
    counts[color]++;
    rightTableElement.innerHTML += getItem(text, color, element._id, true);
  });

  const appointmentWord = (count) => `appointment${count > 1 ? "s" : ""}`;
  appointmentsAmountInfo.innerHTML = "";
  if (counts.green) {
    appointmentsAmountInfo.innerHTML += `${convertNumberToWords(
      counts.green,
    )} green ${appointmentWord(counts.green)}. `;
  }

  if (counts.blue) {
    appointmentsAmountInfo.innerHTML += `${convertNumberToWords(
      counts.blue,
    )} blue ${appointmentWord(counts.blue)}.`;
  }
};
export async function tables() {
  const eventSource = new EventSource(host + "/api/events");

  eventSource.onmessage = async () => {
    await updateTables();
  };

  saveButton.addEventListener("click", () => {
    const data = rightTable.map((element) => ({
      _id: element._id,
      time: element.time,
    }));
    fetch(host + "/api", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    console.log(data);
  });
}
