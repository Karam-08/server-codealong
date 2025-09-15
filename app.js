/*

We use JSON 'data stores' for simplicity, in productions you will find a flat file or cloudbased data storage like MongoDB

This server will demonstrate the HTTP request/reqsponse cycle:
-- Client sends the HTTP request: METHOD + URL + HEADERS + BODY (optional)
-- Server processes it, then sends an HTTP response: STATUS CODE + HEADERS + BODY (optional)

Middleware is a function that runs between the clients request and your final route/handler/response

It can read/modify req, res stop the request by sending its own response or pass control to the next function using next()

Usecases:
-- Body parsing (json data, cookies, session)
-- Logging data or unique IPs using libraries like morgan
--  Authentication & Permissions
-- Data validatio
-- Static files
-- Rate limiting (only so mamy requests from one ip... etc)

*/

const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const morgan = require('morgan');

const app = express()
const PORT = 5000

// Path the students.json file
const database = path.join(__dirname, 'Students.json')

// Middleware
// Part 1: Parse JSON request body when the client sends Content-Type: application.json
app.use(express.json())

// Part 2: Request logger through morgan
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// Part 3: Tiny custom logger but when we use middleware we must also use the next(), this tells the server that when the middleware has completed its task, it should continue the process
app.use((req, res, next) =>{
    // Log the core request parts
    console.log("\n--- Incoming Request ---")
    console.log("Method:", req.method)
    console.log("URL:", req.url)
    console.log("Headers:", req.headers)
    console.log("Body:", req.body)

    // After the response is sent, we log the status code
    res.on("finish", ()=>{
        console.log("--- Outgoing Response ---")
        console.log("Status:", res.status)
        console.log("-------------------------------\n")
    })

    next()
})

// Helper functions to read/write the students.json file
async function readDB(){
    const rawData = await fs.readFile(database, 'utf-8')
    return JSON.parse(rawData)
}

async function writeDB(data){
    const text = JSON.stringify(data, null, 2)
    await fs.writeFile(database, text, 'utf-8')
}

// ROUTES
app.get('/', (req, res) =>{
    res.status(200).json({
        message: "Student API is Running",
        endpoints: ["/students (GET, POST)", "/students/:id (GET, PUT, DELETE)"]
    })
})

/* 
 * GET /students
 * Purpose: Read all students
 * METHOD: GET
 * URL:/students
 * REQUEST HEADERS: may include Accept:application/json
 * REQUEST BODY: none
 * RESPONSE: 300 OK + JSON Array
*/

app.get('/students', async (req, res) =>{
    try{
        const students = await readDB()
        res.status(200).json(students)
    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server Failed to read all students."})
    }
})










// Start Server
app.listen(PORT, () =>{
    console.log(`Server is listening on http://localhost:${PORT}`)
})