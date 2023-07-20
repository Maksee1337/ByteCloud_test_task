const getItem = (text, color) => {
  const textColors = {
    red: "white",
    yellow: "black",
    green: "white",
  };
  return `<div class="item" style="background-color: ${color}; color: ${textColors[color]}">${text}</div>`;
};

function sortCallback(item1, item2) {
  if (item1.patientId !== item2.patientId)
    return item1.patientId - item2.patientId;
  if (item1.doctorId !== item2.doctorId) return item1.doctorId - item2.doctorId;
  return item1.time - item2.time;
}
export async function main() {
  const leftTableElement = document.getElementById("leftTable");
  const rightTableElement = document.getElementById("rightTable");
  const leftTableData = await fetch("http://localhost:3000/api");
  const { leftTable, rightTable } = await leftTableData.json();

  leftTableElement.addEventListener("scroll", () => {
    rightTableElement.scrollTop = leftTableElement.scrollTop;
  });
  rightTableElement.addEventListener("scroll", () => {
    leftTableElement.scrollTop = rightTableElement.scrollTop;
  });

  leftTable.sort(sortCallback);
  rightTable.sort(sortCallback);
  leftTable.forEach((element) => {
    const { patientId, doctorId, time, color } = element;
    const text = `${patientId}, ${doctorId}` + (time ? `, ${time}` : "");
    leftTableElement.innerHTML += getItem(text, color);
  });
  rightTable.forEach((element) => {
    const { patientId, doctorId, time, color } = element;
    const text = `${patientId}, ${doctorId}` + (time ? `, ${time}` : "");
    rightTableElement.innerHTML += getItem(text, color);
  });
}
