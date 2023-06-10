const axios = require('axios');
const express = require('express')
const bodyParser = require("body-parser")
const xmlParser = require("express-xml-bodyparser")
const xml = require('xml')

var myparam ={}

let lastDeletionTime = Date.now();

function transformCommand(command,newInput) {
    const newCommand = {
      COMMAND: []
    };
  
    for (let key in command) {
        if(key.toUpperCase()!=="FROMMULTIUSSD" && key.toUpperCase()!=="SPID" && key.toUpperCase()!=="AGENTID" && key.toUpperCase()!=="RESUME" && key.toUpperCase()!=="INPUT" )
      newCommand.COMMAND.push({ [key.toUpperCase()]: command[key] });
    }
    newCommand.COMMAND.push({ MESSAGE: [`Your phone number is: ^^ ${command.msisdn[0]}  ^^ ${command.newrequest[0]} ^^ ${newInput}`] });
    newCommand.COMMAND.push({ FREEFLOW: ['C'] });
    newCommand.COMMAND.push({ MENUS: {} });
    return newCommand;
  }



const app = express()
const port = process.env.PORT || 4000
// middleware
app.use(express.json())
app.use(xmlParser())


const addParamsMiddleware = (req, res, next) => {
  const currentTime = Date.now();
  const tenMinutes = 3 * 60 * 1000; // 10 minutes in milliseconds

  // Check if ten minutes have passed since the last deletion
  if (currentTime - lastDeletionTime >= tenMinutes) {
    console.log("haha")
    myparam = {}
    req.query["myinput"] = ""; 
    if(req.body.command.input[0]!=="124*313" &&req.body.command.input[0]!==""){
      myparam[req.body.command.sessionid[0]] = req.body.command.input[0]
      }// Clear req.query object
    lastDeletionTime = currentTime; 
    req.query["myinput"]=myparam// Update the last deletion time
  }
  else{
    if (myparam[req.body.command.sessionid[0]] !== undefined) {
      if(req.body.command.input[0]!=="124*313" &&req.body.command.input[0]!==""){
      myparam[req.body.command.sessionid[0]] = myparam[req.body.command.sessionid[0]]+"*"+req.body.command.input[0]
      }
    }
    else{
      if(req.body.command.input[0]!=="124*313" &&req.body.command.input[0]!==""){
        myparam[req.body.command.sessionid[0]] = req.body.command.input[0]
        }
    }
    req.query["myinput"]=myparam
  }
  
  
  
  next();
};

app.use(addParamsMiddleware);




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.listen(port, () => {
    console.log("listening", port)
})


app.get('/', (req, res) => {
    res.send("Success Message")
})



app.post('/', (req, res) => {
    var sessionId = req.body.command.sessionid[0]
    response = transformCommand(req.body.command,req.query["myinput"][sessionId])

    res.set('Content-type','text/xml')
    res.send(xml(response,true));
    res.end

   


})

