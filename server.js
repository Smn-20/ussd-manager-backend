const axios = require('axios');
const express = require('express')
const bodyParser = require("body-parser")
const xmlParser = require("express-xml-bodyparser")
const xml = require('xml')

var myparam ={}


function transformCommand(command,newMessage,flow) {
    const newCommand = {
      COMMAND: []
    };
  
    for (let key in command) {
        if(key.toUpperCase()!=="FROMMULTIUSSD" && key.toUpperCase()!=="SPID" && key.toUpperCase()!=="AGENTID" && key.toUpperCase()!=="RESUME" && key.toUpperCase()!=="INPUT" )
      newCommand.COMMAND.push({ [key.toUpperCase()]: command[key] });
    }
    newCommand.COMMAND.push({ MESSAGE: [newMessage] });
    newCommand.COMMAND.push({ FREEFLOW: [flow] });
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
  // if (currentTime - lastDeletionTime >= tenMinutes) {
  //   console.log("haha")
  //   myparam = {}
  //   req.query["myinput"] = ""; 
  //   if(req.body.command.input[0]!=="124*313" &&req.body.command.input[0]!==""){
  //     myparam[req.body.command.sessionid[0]] = req.body.command.input[0]
  //     }// Clear req.query object
  //   lastDeletionTime = currentTime; 
  //   req.query["myinput"]=myparam// Update the last deletion time
  // }
  // else{
    if (myparam[req.body.command.sessionid[0]] !== undefined) {
      if(req.body.command.input[0]!=="124*313" &&req.body.command.input[0]!==""){
      myparam[req.body.command.sessionid[0]] = myparam[req.body.command.sessionid[0]]+"*"+req.body.command.input[0]
      }
    }
    else{
      if(req.body.command.input[0]!==""){
        myparam[req.body.command.sessionid[0]] = req.body.command.input[0]
        const deletionTimer = setTimeout(() => {
          delete myparam[req.body.command.sessionid[0]]; // Remove the attribute after 3 minutes
        }, 3 * 60 * 1000); 
        }
    }
    req.query["myinput"]=myparam
  // }
  
  
  
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

let token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIDE5OTMgOCAwMDA0ODg5IDIgMDIiLCJpYXQiOjE2ODE4MDgwMDIsImV4cCI6MjAwMjgwODAwMiwicGVybWlzc2lvbnMiOlsiQVBQUk9WRV9BUFBFQUwiLCJSRUpFQ1RfQVBQRUFMIiwiVFJBTlNGRVJfSE9VU0VfSE9MRCIsIlZJRVdfQURNSU5JU1RSQVRJVkVfRU5USVRZIiwiVklFV19IT1VTRV9IT0xEIiwiVklFV19NRU1CRVIiLCJWSUVXX1FVRVNUSU9OTkFJUkUiXX0.UTLdkYHlXHulx326Pmuign58DttHiu7EXWPQ446d-naJsPykjGxoEm_yx2331Eo3n_vvVxjr9eaNHV8y2MjfzA';


app.post('/', (req, res) => {
    var sessionId = req.body.command.sessionid[0]
    console.log(req.query["myinput"])
    console.log(req.body)
    var response_;

    var array = req.query["myinput"][sessionId].split('*')

    console.log(array)
    if(array.length === 2){
      response_ = transformCommand(req.body.command,"Murakaza neza kuri Social registry ^ Shyiramo nomero yawe y'indangamuntu","C")
      res.set('Content-type','text/xml')
      res.send(xml(response_,true));
      res.end
    }

    if (array.length === 3) {
      const options = {
          method: 'POST',
          url: 'https://api-gateway.uat.minaloc.gov.rw/users/auth/login-ussd',
          headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${token}`,
              'identificationNumber': array[2],
              'phone': req.body.command.msisdn[0].slice(2)
          }
      };

      

      axios.request(options).then(function (response) {
          console.log(response.data.status)
          if (response.data.status == true) {

             
              response_ = transformCommand(req.body.command,"Hitamo ^ 1) Abanyamuryango ^ 2) Ibikorwa ugenewe ^ 3) Ishusho rusange y’umutungo","C")

              res.set('Content-type','text/xml')
              res.send(xml(response_,true));
              res.end
          }
          else {
              response_ = transformCommand(req.body.command,"Wanditse irangamuntu nabi","B")

              res.set('Content-type','text/xml')
              res.send(xml(response_,true));
              res.end
          }
      }).catch((err)=>{
              response_ = transformCommand(req.body.command,"Wanditse irangamuntu nabi","B")

              res.set('Content-type','text/xml')
              res.send(xml(response_,true));
              res.end
      })


    }




    if (array.length === 4) {
      if (array[3] == "1") {
          response_ = transformCommand(req.body.command,"1) Amakuru yimbitse y’urugo ^ 2) Abagize urugo","C")

          res.set('Content-type','text/xml')
          res.send(xml(response_,true));
          res.end
      }

      if (array[3] == "2") {
          response_ = transformCommand(req.body.command,"Andika UPI yaho ushaka kwimukira ^","C")

          res.set('Content-type','text/xml')
          res.send(xml(response_,true));
          res.end
      }

      if (array[3] == "3") {

          response_ = transformCommand(req.body.command,"Hitamo ^ 1) Abanyamuryango ^ 2) Ibikorwa ugenewe ^ 3) Ishusho rusange y’umutungo","C")

          res.set('Content-type','text/xml')
          res.send(xml(response_,true));
          res.end
      }
    }

    if (array.length === 5) {
      if (array[3] == "1") {
          if (array[4] == "1") {
              const options = {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                      'documentNumber': array[2],
                  }
              };

              axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/view/household/by-document-number`, options).then((resp) => {
                  console.log(resp.data)
                  response_ = transformCommand(req.body.command,`Irangamuntu y'umukuru w'urugo:${resp.data.response.householdHead.nationalId} ^ Umukuru w'urugo: ${resp.data.response.householdHead.firstName} ${resp.data.response.householdHead.lastName}  ^ Kode: ${resp.data.response.code} ^ Ingano : ${resp.data.response.size} ^ Porogarumu: ${resp.data.response.targetingProgram}`,"B")

                  res.set('Content-type','text/xml')
                  res.send(xml(response_,true));
                  res.end
              }).catch((error) => {
                  console.log(error)
              })

          }
          if (array[4] == "2") {
              const options = {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                      'documentNumber': array[2],
                  }
              };

              axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/view/household/by-document-number`, options).then((resp) => {
                  console.log(resp.data.response)
                  axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/${resp.data.response.id}/members`, {
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                      }
                  }).then((resp) => {
                      console.log(resp.data.response.members)
                      var members = "Abagize urugo ^";

                      if (resp.data.response.members.length > 0) {
                          for (var i = 0; i < resp.data.response.members.length; i++) {
                            members += `${i + 1}. ${resp.data.response.members[i].firstName} ${resp.data.response.members[i].lastName} ^`
                          }
                      }
                      else {
                        members += 'Ntabandi bagize urugo'
                      }



                      response_ = transformCommand(req.body.command,members,"B")

                      res.set('Content-type','text/xml')
                      res.send(xml(response_,true));
                      res.end
                  }).catch((error) => {
                      console.log(error)
                  })
              }).catch((error) => {
                  console.log(error)
              })

          }
      }
      if (array[3] == "3") {
          response_ = transformCommand(req.body.command,"Andika Impamvu ^","C")

          res.set('Content-type','text/xml')
          res.send(xml(response_,true));
          res.end

      }


      if (array.length == 5 && array[3] == "2") {
          const options = {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'upi': array[4],
              }
          };

          axios.get(`https://api-gateway.uat.minaloc.gov.rw/land/upi/details`, options).then((resp) => {
            //   console.log(resp.data.response)
              const upiInfo = resp.data.response
                if (resp.data.status == true) {
                  const villageCode = resp.data.response.parcelLocation.village.villageCode
                  const _villageCode = villageCode.substring(0, 1) + villageCode.substring(2);
                  const options__ = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'documentNumber': array[2],
                    }
                };

                      axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/view/household/by-document-number`, options__).then((resp) => {
                            console.log(resp.data)
                          const options_ = {
                              method: 'POST',
                              url: 'https://api-gateway.uat.minaloc.gov.rw/households/transfer',
                              headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`,
                              },
                              data: JSON.stringify({
                                  "householdId": resp.data.response.id,
                                  "villageCode": _villageCode,
                                  'upi': upiInfo.upi,
                                  'latitude': upiInfo.centralCoordinate.lat,
                                  'longitude': upiInfo.centralCoordinate.lon,
                                  'userType': 'CITIZEN',
                                  'event': "REQUEST",
                                  'memberDocumentNumber': array[2],
                                  'phoneNumber':req.body.command.msisdn[0].slice(2)
                              })
                          };

                          console.log(JSON.stringify({
                            "householdId": resp.data.response.id,
                            "villageId": _villageCode,
                            'upi': upiInfo.upi,
                            'latitude': upiInfo.centralCoordinate.lat,
                            'longitude': upiInfo.centralCoordinate.lon,
                            'userType': 'CITIZEN',
                            'event': "REQUEST",
                            'memberDocumentNumber': array[2],
                            'phoneNumber':req.body.command.msisdn[0].slice(2)
                        }))

                          axios.request(options_).then(function (response) {
                              console.log(response.data.response)
                              if (response.data.status == true) {
                                  var transMessage = "Ubasabe bwakiriwe ^";
                              }
                              else {
                                var transMessage = response.data.response;
                              }
                              response_ = transformCommand(req.body.command,transMessage,"B")

                              res.set('Content-type','text/xml')
                              res.send(xml(response_,true));
                              res.end
                          }).catch(function (error) {
                              console.error(error);
                          });
                      }).catch((error) => {
                          console.log(error)
                      })


                

              }
              else {
                response_ = transformCommand(req.body.command,"Mwanditse UPI itariyo","B")

                res.set('Content-type','text/xml')
                res.send(xml(response_,true));
                res.end
              }
          }).catch((error) => {
              console.log(error)
          })

      }

    }



    if (array.length === 6) {

      
      if (array[3] == "3") {

          const options = {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'documentNumber': array[2],
              }
          };

          axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/view/household/by-document-number`, options).then((resp) => {
              console.log(resp.data.response)
              const options_ = {
                  method: 'POST',
                  url: 'https://api-gateway.uat.minaloc.gov.rw/households/public/appeals',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                  },
                  data: JSON.stringify({
                      "documentNumber": array[2],
                      "option": array[4] == 1 ? "PERSONAL_INFO" : (array[4] == 2 ? "ENROLLED_PROGRAM" : "SOCIAL_ECONOMIC"),
                      "description": array[5],
                      "householdID": resp.data.response.id,
                      'phoneNumber':req.body.command.msisdn[0].slice(2)
                  })
              };


              axios.request(options_).then(function (response) {
                  console.log(response.data)
                  if (response.data.status == true) {
                      var appealMessage = "Ubasabe bwakiriwe ^";
                  }
                  else {
                    var appealMessage = "Appeal request failed ^";
                  }
                  response_ = transformCommand(req.body.command,appealMessage,"B")

                  res.set('Content-type','text/xml')
                  res.send(xml(response_,true));
                  res.end
              }).catch(function (error) {
                  console.error(error);
              });
          }).catch((error) => {
              console.log(error)
          })

      }
  }

})



