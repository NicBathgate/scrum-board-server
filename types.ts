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
