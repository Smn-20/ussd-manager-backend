const express = require('express')
const bodyParser = require("body-parser")
const xmlParser = require("express-xml-bodyparser")
const xml = require('xml');
const ussdWorker  = require('./worker');

var myparam = {}

function transformCommand(command, newMessage, flow) {
    const newCommand = {
        COMMAND: []
    };

    for (let key in command) {
        if (key.toUpperCase() !== "FROMMULTIUSSD" && key.toUpperCase() !== "SPID" && key.toUpperCase() !== "AGENTID" && key.toUpperCase() !== "RESUME" && key.toUpperCase() !== "INPUT")
            newCommand.COMMAND.push({ [key.toUpperCase()]: command[key] });
    }
    newCommand.COMMAND.push({ MESSAGE: [newMessage] });
    newCommand.COMMAND.push({ FREEFLOW: [flow] });
    newCommand.COMMAND.push({ MENUS: {} });
    return newCommand;
}


const app = express()
const port = process.env.PORT || 4005
// middleware
app.use(express.json())
app.use(xmlParser())


const addParamsMiddleware = (req, res, next) => {
    const currentTime = Date.now();
    const tenMinutes = 3 * 60 * 1000; // 10 minutes in milliseconds

    
    if (myparam[req.body.command.sessionid[0]] !== undefined) {
        if (req.body.command.input[0] !== "124*313" && req.body.command.input[0] !== "") {
            if(req.body.command.input[0] =="0"){
            var myarray = myparam[req.body.command.sessionid[0]].split('*')
            if(myarray.length>3){
                myarray.pop()
                myparam[req.body.command.sessionid[0]]=myarray.join("*")
            }
            
            }
            else{
            myparam[req.body.command.sessionid[0]] = myparam[req.body.command.sessionid[0]] + "*" + req.body.command.input[0]
            }
        }
    }
    else {
        if (req.body.command.input[0] !== "") {
            myparam[req.body.command.sessionid[0]] = req.body.command.input[0]
            const deletionTimer = setTimeout(() => {
                delete myparam[req.body.command.sessionid[0]]; // Remove the attribute after 3 minutes
            }, 3 * 60 * 1000);
        }
    }
    req.query["myinput"] = myparam



    next();
};

app.use(addParamsMiddleware);




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.listen(port, '0.0.0.0', () => {
    console.log("listening", port)
})


app.get('/', (req, res) => {
    res.send("Success Message")
})



app.post('/', (req, res) => {
    var sessionId = req.body.command.sessionid[0]
    console.log(req.query["myinput"])
    console.log(req.body)
    var response_;

    var array = req.query["myinput"][sessionId].split('*')

    if (req.body.command.newrequest[0] == "1") {
        if (req.body.command.input[0] !== "124*313") {
            response_ = transformCommand(req.body.command, "Koresha *124*313# ", "B")

            res.set('Content-type', 'text/xml')
            res.send(xml(response_, true));
            res.end
        }
        else {
            ussdWorker(array,req.body.command,res);
        }
    }
    else {
        ussdWorker(array,req.body.command,res);
    }

})








