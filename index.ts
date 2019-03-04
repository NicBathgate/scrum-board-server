require("dotenv").config();
import fetch, { Headers, Request, RequestInit } from "node-fetch";
import * as express from "express";
import * as cors from "cors";
// import * as _ from 'underscore';
// import moment from 'moment';

const app = express();
app.use(
  cors({ origin: ["http://localhost:3000", "http://nbathgate.adi.co.nz:3000"] })
);
const port = 8080; // default port to listen

// const router = express.Router();
// router.get('/', (req, res, next) => res.render('index', { title: 'Scrum Board' }));
// module.exports = router;

// define a route handler for the default home page
app.get("/", async (req, res) => {
  try {
    const boards = await getBoards();
    res.json(boards.values);
  } catch (err) {
    console.log(err);
  }
});

app.get("/board/:id/sprint", async (req, res) => {
  try {
    const sprintList = await fetchAuth(
      `${JIRA_URL}/rest/agile/1.0/board/${req.params.id}/sprint?state=active`
    );
    res.json({ sprint: sprintList.values[0] });
  } catch (err) {
    console.log(err);
  }
});

app.get("/board/:id", async (req, res) => {
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

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

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
  let headers = new Headers();
  headers.append(
    "Authorization",
    "Basic " +
      Buffer.from(ATLASSIAN_USERNAME + ":" + ATLASSIAN_API_KEY).toString(
        "base64"
      )
  );
  modifiedOptions.headers = headers;
  const result = await fetch(url, modifiedOptions);
  if (result.ok) {
    return await result.json();
  } else {
    throw Error(`${result.status}: ${result.statusText}`);
  }
}

export interface SprintList {
  maxResults: number;
  startAt: number;
  isLast: boolean;
  values: Sprint[];
}

export interface Sprint {
  id: number;
  self: string;
  state: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  completeDate?: Date;
  originBoardId: number;
}

export interface IssueList {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: Issue[];
}
export interface StoryList {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: Story[];
}
export interface SubtaskList {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: SubTask[];
}

export interface Issue {
  id: string;
  self: string;
  key: string;
  fields: IssueFields;
}
export interface Story {
  id: string;
  self: string;
  key: string;
  fields: StoryFields;
}
export interface SubTask {
  id: string;
  key: string;
  self: string;
  fields: SubtaskFields;
}
interface IssueFields {
  issuetype: IssueType;
  status: Status;
  summary: string;
  description: string;
  assignee: Actor;
  created?: Date;
  creator: Actor;
  labels?: string[];
  priority: Priority;
  reporter: Actor;
  updated?: Date;
}
interface StoryFields extends IssueFields {
  epic: {
    id: number;
    key: string;
    self: string;
    name: string;
    summary: string;
    done: boolean;
  };
  closedSprints: [];
  customfield_10806: number;
  customfield_11400?: Actor[];
  subtasks: SubTask[];
}
interface SubtaskFields extends IssueFields {
  resolutiondate?: Date;
  resolution?: { name: string };
  parent?: Issue;
}

export interface Sprint {
  completeDate?: Date;
  endDate?: Date;
  startDate?: Date;
  goal: string;
  id: number;
  name: string;
  originBoardId: number;
  self: string;
  state: string;
}

interface Actor {
  accountId: string;
  active: boolean;
  avatarUrls: {
    "16x16": string;
    "24x24": string;
    "32x32": string;
    "48x48": string;
  };
  displayName: string;
  emailAddress: string;
  name: string;
  timeZone: string;
}

interface Status {
  id: string;
  iconUrl: string;
  name: string;
  self: string;
}

interface Priority {
  id: string;
  name: string;
  self: string;
  iconUrl: string;
}

interface IssueType {
  id: string;
  name: string;
  iconUrl: string;
  self: string;
  subtask: boolean;
}

export interface EpicList {
  [epic: string]: Issue[];
}

export interface BoardList {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: Board[];
}

export interface Board {
  id: number;
  self: string;
  name: string;
  type: string;
  location: {
    projectId: number;
    displayName: string;
    projectName: string;
    projectKey: string;
    projectTypeKey: string;
    avatarURI: string;
    name: string;
  };
}
