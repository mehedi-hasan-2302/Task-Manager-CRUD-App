const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises'); 

const app = express();
const PORT = 3000;
const TASKS_FILE = 'tasks.json';

app.use(bodyParser.json());


let tasks = [];

async function loadTasks() {
    try {
        const data = await fs.readFile(TASKS_FILE);
        tasks = JSON.parse(data);
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}


