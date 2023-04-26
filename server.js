const axios = require('axios');
const express = require('express')
const bodyParser = require("body-parser")



const app = express()
const port = process.env.PORT || 4000
// middleware
app.use(express.json())

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
    const { SESSIONID, MSISDN, INPUT, NEWREQUEST } = req.body
    

        response = JSON.stringify({
            "MSISDN": MSISDN,
            "SESSIONID": SESSIONID,
            "FREEFLOW": "C",
            "MESSAGE": `MSISDN ${MSISDN}, SESSIONID ${SESSIONID}, INPUT ${INPUT}, NEWREQUEST ${NEWREQUEST}`,
            "NEWREQUEST": 0,
            "MENUS": "menus",
        });


        res.send(response);
        res.end

   


})

