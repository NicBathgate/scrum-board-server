require('dotenv').config();
import fetch, {RequestInit, Request, Headers} from 'node-fetch';
// import * as fs from 'fs-extra';
// import * as _ from 'underscore';
// import moment from 'moment';

const ATLASSIAN_USERNAME = process.env.ATLASSIAN_USERNAME || '';
const ATLASSIAN_API_KEY = process.env.ATLASSIAN_API_KEY || '';
const BOARD_NAME = 'MKTG board';
const JIRA_URL = 'https://adinstruments.atlassian.net';


async function run(){
    // Fetch board/sprint information from Jira
    const boards: BoardList = await fetchAuth(`${JIRA_URL}/rest/agile/1.0/board`);
    // const board = boards.values.filter(board => board.type === 'scrum' && board.name === BOARD_NAME);
    // if(board.length === 0) throw Error(`Board "${BOARD_NAME}" not found, check the board exists and that you have permissions for it`);
    console.log(boards);
}

run().then(() => {}).catch(error => {
    console.error(error);
    process.exit(1);
});

async function fetchAuth(url: string | Request, options?: RequestInit){
    let modifiedOptions = options === undefined ? {} : options;
    let headers = new Headers();
    headers.append('Authorization', 'Basic '+Buffer.from(ATLASSIAN_USERNAME+':'+ATLASSIAN_API_KEY).toString('base64'));
    modifiedOptions.headers = headers;
    const result = await fetch(url, modifiedOptions);
    if(result.ok){
        return await result.json();
    } else {
        throw Error(`${result.status}: ${result.statusText}`);
    }
}

interface SprintList {
    maxResults: number;
    startAt: number;
    isLast: boolean;
    values: Sprint[];
}

interface Sprint {
    id: number;
    self: string;
    state: string;
    name: string;
    startDate?: Date;
    endDate?: Date;
    completeDate?: Date;
    originBoardId: number;
}

interface IssueList {
    expand: string;
    startAt: number;
    maxResults: number;
    total: number;
    issues: Issue[];
}

interface Issue {
    id: string;
    self: string;
    key: string;
    fields: {
        epic: {
            id: number;
            key: string;
            self: string;
            name: string;
            summary: string;
            done: boolean;
        };
        status: {
            self: string;
            name: string;
        };
        summary: string;
        description: string;
        customfield_10806: number;
    };
}

interface EpicList {
    [epic: string]: Issue[];
}

interface BoardList {
    maxResults: number;
    startAt: number;
    total: number;
    isLast: boolean;
    values: Board[];
}

interface Board {
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