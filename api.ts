import * as express from "express";
import {
  Board,
  BoardList,
  Sprint,
  SprintList,
  StoryList,
  SubtaskList
} from "./types";
import fetch, { Headers, Request, RequestInit } from "node-fetch";
const router = express.Router();

const ATLASSIAN_USERNAME = process.env.ATLASSIAN_USERNAME || "";
const ATLASSIAN_API_KEY = process.env.ATLASSIAN_API_KEY || "";
const JIRA_URL = "https://adinstruments.atlassian.net";

async function getBoards() {
  // Fetch board/sprint information from Jira
  // const board = boards.values.filter(board => board.type === 'scrum' && board.name === BOARD_NAME);
  // if(board.length === 0) throw Error(`Board "${BOARD_NAME}" not found, check the board exists and that you have permissions for it`);
  return await fetchAuth(`${JIRA_URL}/rest/agile/1.0/board`);
}

async function fetchAuth(url: string | Request, options?: RequestInit) {
  let modifiedOptions = options === undefined ? {} : options;
  let headers =
    options && options.headers
      ? new Headers(<Headers>options.headers)
      : new Headers();
  headers.append(
    "Authorization",
    "Basic " +
      Buffer.from(ATLASSIAN_USERNAME + ":" + ATLASSIAN_API_KEY).toString(
        "base64"
      )
  );
  modifiedOptions.headers = headers;
  const response = await fetch(url, modifiedOptions);
  if (response.ok) {
    if (response.status === 204) return response.status;
    return await response.json();
  } else {
    throw Error(`${response.status}: ${response.statusText}`);
  }
}

// define a route handler for the default home page
// router.get('/', (req, res, next) => res.render('index', { title: 'Scrum Board' }));
router.get("/", async (req, res) => {
  try {
    const boards = await getBoards();
    res.json(boards.values);
  } catch (err) {
    console.log(err);
  }
});

router.post("/issue/:id/transitions", async (req, res) => {
  try {
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transition: req.body.transition
      })
    };
    const result = await fetchAuth(
      `${JIRA_URL}/rest/api/3/issue/${req.params.id}/transitions`,
      options
    );
    res.json({ result });
  } catch (err) {
    console.log(err);
  }
});

router.get("/board/:id/sprint", async (req, res) => {
  try {
    const sprintList = await fetchAuth(
      `${JIRA_URL}/rest/agile/1.0/board/${req.params.id}/sprint?state=active`
    );
    res.json({ sprint: sprintList.values[0] });
  } catch (err) {
    console.log(err);
  }
});

router.get("/board/:id", async (req, res) => {
  try {
    const boards: BoardList = await getBoards();
    const board: Board = boards.values.find(
      board => board.id === parseInt(req.params.id)
    );
    const boardURL = `${board.self}/sprint`;
    const sprints: SprintList = await fetchAuth(boardURL);
    const latestSprint = sprints.values
      .filter(sprint => sprint.startDate)
      .sort((a: Sprint, b: Sprint) => b.id - a.id)[0];
    const storyFields = [
      "id",
      "key",
      "summary",
      "issuetype",
      "assignee",
      "closedSprints",
      "created",
      "creator",
      "epic",
      "labels",
      "priority",
      "reporter",
      "status",
      "subtasks",
      "updated",
      "customfield_11400",
      "customfield_10806"
    ];
    const storiesUrl = `${
      latestSprint.self
    }/issue?maxResults=1000&jql=issuetype=Story&fields=${storyFields.toString()}`;
    const stories: StoryList = await fetchAuth(storiesUrl);
    const subtaskFields = [
      "id",
      "key",
      "self",
      "issuetype",
      "priority",
      "status",
      "summary",
      "assignee",
      "parent",
      "resolution",
      "resolutiondate"
    ];
    const subtasksUrl = `${
      latestSprint.self
    }/issue?maxResults=1000&jql=issuetype=Sub-Task&fields=${subtaskFields.toString()}`;
    const subtasks: SubtaskList = await fetchAuth(subtasksUrl);

    const storiesWithFullSubtasks = stories.issues.map(story => {
      story.fields.subtasks = subtasks.issues.filter(
        subtask => subtask.fields.parent.id === story.id
      );
      return story;
    });

    res.json({ stories: storiesWithFullSubtasks });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
