const host = "http://localhost:3000";
const saveButton = document.getElementById("saveButton");
const clearDbButton = document.getElementById("clearDB");
const patients = document.getElementById("patients");
const doctors = document.getElementById("doctors");
const appointments = document.getElementById("appointments");

export async function postData() {
  const eventSource = new EventSource(host + "/events");

  eventSource.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log(data);
  };

  clearDbButton.addEventListener("click", async () => {
    const res = await (
      await fetch(host + "/api", {
        method: "DELETE",
      })
    ).json();
    let message = "";
    if (res.appointments.deletedCount)
      message += `\n Deleted appointments: ${res.appointments.deletedCount}`;
    if (res.doctors.deletedCount)
      message += `\n Deleted doctors: ${res.doctors.deletedCount}`;
    if (res.patients.deletedCount)
      message += `\n Deleted patients: ${res.patients.deletedCount}`;
    if (!message) message = "DB is clean";
    alert(message);
  });
  saveButton.addEventListener("click", async () => {
    const data = {
      patients: patients.value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !!line),
      doctors: doctors.value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !!line),
      appointments: appointments.value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !!line),
    };
    const res = await (
      await fetch(host + "/api", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
    ).json();

    console.log(res);
    let message = "";
    if (res.savedPatients.successful.length)
      message += `\nSuccessful patients: \n${res.savedPatients.successful.join(
        "\n",
      )}`;
    if (res.savedDoctors.successful.length)
      message += `\nSuccessful doctors: \n${res.savedDoctors.successful.join(
        "\n",
      )}`;
    if (res.savedAppointments.successful.length)
      message += `\nSuccessful appointments: \n${res.savedAppointments.successful.join(
        "\n",
      )}`;
    //---
    if (res.savedPatients.wrongFormat.length)
      message += `\nWrong format patients: \n${res.savedPatients.wrongFormat.join(
        "\n",
      )}`;
    if (res.savedDoctors.wrongFormat.length)
      message += `\nWrong format doctors: \n${res.savedDoctors.wrongFormat.join(
        "\n",
      )}`;
    if (res.savedAppointments.wrongFormat.length)
      message += `\nWrong format appointments: \n${res.savedAppointments.wrongFormat.join(
        "\n",
      )}`;

    //

    if (res.savedPatients.duplicates.length)
      message += `\nDuplicates patients: \n${res.savedPatients.duplicates.join(
        "\n",
      )}`;
    if (res.savedDoctors.duplicates.length)
      message += `\nDuplicates doctors: \n${res.savedDoctors.duplicates.join(
        "\n",
      )}`;
    alert(message);
    patients.value = "";
    doctors.value = "";
    appointments.value = "";
  });
}
