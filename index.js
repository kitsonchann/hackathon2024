import bodyParser from "body-parser";
import "dotenv/config";
import express from "express";
import { bedrockSample, knowledgeBase } from "./src/service.js";

const app = express();
app.use(bodyParser.json());
const port = 3000;

const BASE_URL= '/api'

app.get(`${BASE_URL}`, (req, res) => {
  res.send("Hello World!");
});

app.post(`${BASE_URL}/bedrock-sample`, async (req, res) => {
  const userMessage = req.body.message;
  const response = await bedrockSample(userMessage);
  res.status(200).json(response);
});

app.post(`${BASE_URL}/knowledge-base`, async (req, res) => {
  const userMessage = req.body.message;
  const response = await knowledgeBase(userMessage);
  res.status(200).json(response);
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
