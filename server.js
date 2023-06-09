const axios = require('axios');
const express = require('express')
const bodyParser = require("body-parser")
const xmlParser = require("express-xml-bodyparser")
const xml = require('xml')

var myparam ="124*313"

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
  if(req.body.command.input[0]!=="124*313" &&req.body.command.input[0]!==""){
    myparam = myparam+"*"+req.body.command.input[0]
  }
  req.body["newInput"]=myparam
  req.query.q=myparam
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
    console.log(req.query.q)
    response = transformCommand(req.body.command,req.body.newInput)

    res.set('Content-type','text/xml')
    res.send(xml(response,true));
    res.end

   


})

