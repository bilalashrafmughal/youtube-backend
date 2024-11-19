const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/date", async (req, res) => {
  try {
    const date = new Date();

    // Get the day of the week (1 to 7, where 1 = Monday and 7 = Sunday)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

    // Get the day name
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    debugger;

    const dayName = days[10];

    // Get the year
    const year = date.getFullYear();

    // Get the month name
    const months = [
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
    const monthName = months[date.getMonth()];

    // Get the day of the month (1 to 31)
    const dayOfMonth = date.getDate();

    // Get time in seconds
    const timeInSeconds = Math.floor(date.getTime() / 1000);

    // Get hours, minutes, seconds
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Format time
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // Get timezone offset in minutes
    const timezoneOffset = date.getTimezoneOffset();
    return res.status(200).json({
      dayOfWeek,
      dayName,
      year,
      monthName,
      dayOfMonth,
      timeInSeconds,
      formattedTime,
      timezoneOffset,
    });
  } catch (err) {
    debugger;
    console.error(err.message);
    console.error(err);
  } finally {
    console.log("Done getting date");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
