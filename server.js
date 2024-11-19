const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const fs = require("fs");
const util = require("util");
const path = require("path");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use("/public", express.static(path.join(__dirname, "public")));

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/tts", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send({ msg: "no text found" });
  }
  const writeFileAsync = util.promisify(fs.writeFile);
  const fileName = `audio-${Math.floor(Math.random() * 20)}.mp3`;
  const outputPath = path.join("./public", fileName);
  const googleClient = new TextToSpeechClient();
  const request = {
    input: { text: text },
    voice: {
      languageCode: "en-US",
      ssmlGender: "MALE",
      name: "en-US-Neural2-J",
    },
    audioConfig: { audioEncoding: "MP3" },
  };
  debugger;
  try {
    const [response] = await googleClient.synthesizeSpeech(request);

    await writeFileAsync(outputPath, response.audioContent);
    const url = `http://localhost:8080/public/${fileName}`;
    return res.status(200).json({
      url,
    });
  } catch (err) {
    debugger;
    console.error(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
