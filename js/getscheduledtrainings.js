Array.prototype.sortByKey = function (key) {
  return this.sort(function (a, b) {
    const x = a[key];
    const y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
};

const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

Date.prototype.getMonthName = function () {
  return months[this.getMonth()];
};
Date.prototype.getDayName = function () {
  return days[this.getDay()];
};

const pad = (integer) => (integer < 10 ? `0${integer}` : integer);

const transformScheduledTrainings = (data) => {
    const b = [],
      c = [],
      getTimeslot = (obj) => {
        let st = new Date(obj.start),
          en = new Date(obj.end),
          slot = `${st.getDayName()}, ${st.getMonthName()}`;

        slot += ` ${st.getDate()} (${pad(st.getHours())}:${pad(
          st.getMinutes()
        )} - ${pad(en.getHours())}:${pad(en.getMinutes())})`;

        return slot;
      };

    let newIdx = 0,
      currId = data[newIdx].id,
      temp = {};

    data.sortByKey("id").forEach((obj, idx) => {
      if (obj.id !== currId) {
        currId = obj.id;
        newIdx++;
        b.length = 0;
      }

      temp = { ...obj };
      delete temp.trainerId;
      delete temp.trainerName;
      delete temp.start;
      delete temp.end;

      b.push({
        id: obj.scheduleddatetimesId,
        trainerId: obj.trainerId,
        trainerName: obj.trainerName,
        start: obj.start,
        end: obj.end,
        slot: getTimeslot(obj),
      });

      temp.dateTimeArr = [...b];
      c[newIdx] = { ...temp };
    });

    c.reverse();

    // l(c);
    return c;
  },
  createMenuItem = (trainings) => {
    // l(trainings, $("#trainings-dropdown"));
    if (!trainings.length) {
      $("<span>", {
        text: "No trainings",
      }).appendTo("#trainings-dropdown");
    } else {
      trainings.forEach((training) => {
        $("<a>", {
          text: training.trainingName,
          class: "dropdown-item",
          href: "https://www.agilesense.co.za/training/detail/?training=" + training.slug,
          target: "_blank",
        }).appendTo("#trainings-dropdown");
      });
    }
  };

try {
  const url =
      "https://www.agilesense.co.za/training/be/api/v1/scheduledtrainings",
    // "https://envisagecyberart.in/projects/agilesense/training/be/api/v1/scheduledtrainings",
    headerDefaults = {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    READ_TOKEN = "PhnrbkAneEp8ATYyMHz5D2jtXSDHRKAsvsJN4Sh805aa9e2f";

  fetch(url, {
    headers: {
      ...headerDefaults,
      Authorization: `Bearer ${READ_TOKEN}`,
    },
  })
    .then((res) => res.json())
    .then((response) =>
      createMenuItem(transformScheduledTrainings(response.data))
    );
} catch (e) {
  l(e);
}
