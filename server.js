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
      response_ = transformCommand(req.body.command,"Welcome to Social Registry ^^ Enter your national ID","C")

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

             
              response_ = transformCommand(req.body.command,"Welcome to SRIS ^^ 1. Household Information. ^^ 2. Transfer household ^^ 3. Appeal","C")

              res.set('Content-type','text/xml')
              res.send(xml(response_,true));
              res.end
          }
          else {
              response_ = transformCommand(req.body.command,"Invalid ID number","B")

              res.set('Content-type','text/xml')
              res.send(xml(response_,true));
              res.end
          }
      }).catch((err)=>{
              response_ = transformCommand(req.body.command,"Invalid ID number","B")

              res.set('Content-type','text/xml')
              res.send(xml(response_,true));
              res.end
      })


    }




    if (array.length === 4) {
      if (array[3] == "1") {
          response_ = transformCommand(req.body.command,"1. See household details. ^^ 2. See household members","C")

          res.set('Content-type','text/xml')
          res.send(xml(response_,true));
          res.end
      }

      if (array[3] == "2") {
          response_ = transformCommand(req.body.command,"Enter UPI of your Location ^^","C")

          res.set('Content-type','text/xml')
          res.send(xml(response_,true));
          res.end
      }

      if (array[3] == "3") {

          response_ = transformCommand(req.body.command,"Select appeal category ^^ 1. Personal info ^^ 2. Enrolled program ^^ 3. Social economic","C")

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
                  response_ = transformCommand(req.body.command,`Household code: ${resp.data.response.code} ^^ Household size: ${resp.data.response.size} ^^ LODA Code: ${resp.data.response.lodaHouseholdCode}  ^^ Target program: ${resp.data.response.targetingProgram} ^^  Score: ${resp.data.response.score}`,"B")

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
                      var members = "Household members ^^";

                      if (resp.data.response.members.length > 0) {
                          for (var i = 0; i < resp.data.response.members.length; i++) {
                            members += `${i + 1}. ${resp.data.response.members[i].firstName} ${resp.data.response.members[i].lastName} ^^`
                          }
                      }
                      else {
                        members += 'There is no other member'
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
          response_ = transformCommand(req.body.command,"Enter your reason ^^","C")

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
              console.log(resp.data.response)
              if (resp.data.status == true) {
                  const cellCode = resp.data.response.parcelLocation.cell.cellCode
                  const _cellCode = cellCode.substring(0, 1) + cellCode.substring(2);
                  axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/locations/villages/cell/code/${_cellCode}`, {
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                      }

                  }).then((resp) => {
                      console.log(resp.data.response)
                      var villages = "Select Village ^^";

                      if (resp.data.response.length > 0) {
                          for (var i = 0; i < resp.data.response.length; i++) {
                              villages += `${i + 1}. ${resp.data.response[i].name} ^^`
                          }
                      }
                      else {
                          villages = 'There is no village'
                      }
                      response_ = transformCommand(req.body.command,villages,"C")

                      res.set('Content-type','text/xml')
                      res.send(xml(response_,true));
                      res.end
                  }).catch((error) => {
                      console.log(error)
                  })

              }
              else {
                response_ = transformCommand(req.body.command,"Invalid UPI","B")

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

      if (array[3] == "2") {


          const options = {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'upi': array[4],
              }
          };

          axios.get(`https://api-gateway.uat.minaloc.gov.rw/land/upi/details`, options).then((resp) => {
              console.log(resp.data.response)
              const upiInfo = resp.data.response
              if (resp.data.status == true) {
                  const cellCode = resp.data.response.parcelLocation.cell.cellCode
                  const _cellCode = cellCode.substring(0, 1) + cellCode.substring(2);
                  axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/locations/villages/cell/code/${_cellCode}`, {
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                      }

                  }).then((resp) => {
                      let villageId;
                      for (var i = 0; i < resp.data.response.length; i++) {
                          if (array[5] == i + 1) {
                              villageId = resp.data.response[i].id
                          }
                      }
                      const options__ = {
                          headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                              'documentNumber': array[2],
                          }
                      };

                      axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/view/household/by-document-number`, options__).then((resp) => {
                          const options_ = {
                              method: 'POST',
                              url: 'https://api-gateway.uat.minaloc.gov.rw/households/transfer',
                              headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`,
                              },
                              data: JSON.stringify({
                                  "householdId": resp.data.response.id,
                                  "villageId": villageId,
                                  'upi': upiInfo.upi,
                                  'latitude': upiInfo.centralCoordinate.y,
                                  'longitude': upiInfo.centralCoordinate.x,
                                  'userType': 'CITIZEN',
                                  'event': "REQUEST",
                                  'memberDocumentNumber': array[2]
                              })
                          };

                          console.log(JSON.stringify({
                            "householdId": resp.data.response.id,
                            "villageId": villageId,
                            'upi': upiInfo.upi,
                            'latitude': upiInfo.centralCoordinate.y,
                            'longitude': upiInfo.centralCoordinate.x,
                            'userType': 'CITIZEN',
                            'event': "REQUEST",
                            'memberDocumentNumber': array[2]
                        }))

                          axios.request(options_).then(function (response) {
                              console.log(response.data.response)
                              if (response.data.status == true) {
                                  var transMessage = "Transfer sent successfully ^^";
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


                  }).catch((error) => {
                      console.log(error)
                  })

              }

          }).catch((error) => {
              console.log(error)
          })


      }



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
                      "householdID": resp.data.response.id
                  })
              };


              axios.request(options_).then(function (response) {
                  console.log(response.data)
                  if (response.data.status == true) {
                      var appealMessage = "Appeal request sent successfully ^^";
                  }
                  else {
                    var appealMessage = "Appeal request failed ^^";
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



