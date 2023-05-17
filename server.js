const axios = require('axios');
const express = require('express')
const bodyParser = require("body-parser")
const xmlParser = require("express-xml-bodyparser")
const xml = require('xml')



function transformCommand(command) {
    const newCommand = {
      COMMAND: []
    };
  
    for (let key in command) {
        if(key.toUpperCase()!=="FROMMULTIUSSD" && key.toUpperCase()!=="SPID" && key.toUpperCase()!=="AGENTID" && key.toUpperCase()!=="RESUME" && key.toUpperCase()!=="INPUT" )
      newCommand.COMMAND.push({ [key.toUpperCase()]: command[key] });
    }
    newCommand.COMMAND.push({ MESSAGE: [`Your phone number is: ^^ ${command.msisdn[0]}`] });
    newCommand.COMMAND.push({ FREEFLOW: ['B'] });
    newCommand.COMMAND.push({ MENUS: {} });
    return newCommand;
  }



const app = express()
const port = process.env.PORT || 4000
// middleware
app.use(express.json())
app.use(xmlParser())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.listen(port, () => {
    console.log("listening", port)
})


app.get('/', (req, res) => {
    res.send("Success Message")
})




app.post('/', (req, res) => {
    
    response = transformCommand(req.body.command)

    res.set('Content-type','text/xml')
    res.send(xml(response,true));
    res.end

   


})

