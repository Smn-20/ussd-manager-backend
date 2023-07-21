const xml = require('xml');
const axios = require('axios');
const translations  = require('./translation');

function transMessages(language){
    let messages;
    if(language=="1"){
        messages=translations.ki
    }
    else if (language=="2"){
        messages=translations.en
    }
    else if (language=="3"){
        messages=translations.fr
    }
    return messages
}

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

let token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIDE5OTMgOCAwMDA0ODg5IDIgMDIiLCJpYXQiOjE2ODE4MDgwMDIsImV4cCI6MjAwMjgwODAwMiwicGVybWlzc2lvbnMiOlsiQVBQUk9WRV9BUFBFQUwiLCJSRUpFQ1RfQVBQRUFMIiwiVFJBTlNGRVJfSE9VU0VfSE9MRCIsIlZJRVdfQURNSU5JU1RSQVRJVkVfRU5USVRZIiwiVklFV19IT1VTRV9IT0xEIiwiVklFV19NRU1CRVIiLCJWSUVXX1FVRVNUSU9OTkFJUkUiXX0.UTLdkYHlXHulx326Pmuign58DttHiu7EXWPQ446d-naJsPykjGxoEm_yx2331Eo3n_vvVxjr9eaNHV8y2MjfzA';

const ussdWorker = (array,command,res) => {
    console.log(array)

            if (array.length === 2) {
                response_ = transformCommand(command,"Hitamo ururimi ^ 1) Kinyarwanda ^ 2) English ^ 3) Français ^ ", "C")
                res.set('Content-type', 'text/xml')
                res.send(xml(response_, true));
                res.end
            }

            if (array.length === 3) {
                response_ = transformCommand(command, transMessages(array[2]).welcome, "C")
                res.set('Content-type', 'text/xml')
                res.send(xml(response_, true));
                res.end
            }

            if (array.length === 4) {
                const options = {
                    method: 'POST',
                    url: 'https://api-gateway.uat.minaloc.gov.rw/users/auth/login-ussd',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${token}`,
                        'identificationNumber': array[3],
                        'phone': command.msisdn[0].slice(2)
                    }
                };



                axios.request(options).then(function (response) {
                    console.log(response.data.status)
                    if (response.data.status == true) {


                        response_ = transformCommand(command, transMessages(array[2]).initial, "C")

                        res.set('Content-type', 'text/xml')
                        res.send(xml(response_, true));
                        res.end
                    }
                    else {
                        response_ = transformCommand(command, transMessages(array[2]).wrongID, "B")

                        res.set('Content-type', 'text/xml')
                        res.send(xml(response_, true));
                        res.end
                    }
                }).catch((err) => {
                    response_ = transformCommand(command, transMessages(array[2]).wrongID, "B")

                    res.set('Content-type', 'text/xml')
                    res.send(xml(response_, true));
                    res.end
                })


            }


            if (array.length === 5) {
                if (array[4] == "1") {
                    response_ = transformCommand(command, transMessages(array[2]).hhInfo, "C")

                    res.set('Content-type', 'text/xml')
                    res.send(xml(response_, true));
                    res.end
                }

                if (array[4] == "2") {
                    response_ = transformCommand(command, transMessages(array[2]).enterupi, "C")

                    res.set('Content-type', 'text/xml')
                    res.send(xml(response_, true));
                    res.end
                }

                if (array[4] == "3") {

                    response_ = transformCommand(command, transMessages(array[2]).appeal, "C")

                    res.set('Content-type', 'text/xml')
                    res.send(xml(response_, true));
                    res.end
                }
            }

            if (array.length === 6) {
                if (array[4] == "1") {
                    if (array[5] == "1") {
                        const options = {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                                'documentNumber': array[3],
                            }
                        };

                        axios.get(`https://api-gateway.uat.minaloc.gov.rw/households/view/household/by-document-number`, options).then((resp) => {
                            console.log(resp.data)
                            var program = resp.data.response.targetingProgram
                            if (program == null) {
                                program = transMessages(array[2]).none
                            }
                            else {
                                program = program
                            }
                            response_ = transformCommand(command, `${transMessages(array[2]).HHid}:${resp.data.response.householdHead.nationalId} ^ ${transMessages(array[2]).names}: ${resp.data.response.householdHead.firstName} ${resp.data.response.householdHead.lastName}  ^ ${transMessages(array[2]).code}: ${resp.data.response.code} ^ ${transMessages(array[2]).size} : ${resp.data.response.size} ^ ${transMessages(array[2]).program}: ${program}`, "B")

                            res.set('Content-type', 'text/xml')
                            res.send(xml(response_, true));
                            res.end
                        }).catch((error) => {
                            console.log(error)
                        })

                    }
                    if (array[5] == "2") {
                        const options = {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                                'documentNumber': array[3],
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
                                var members = transMessages(array[2]).size + "^" ;

                                if (resp.data.response.members.length > 0) {
                                    for (var i = 0; i < resp.data.response.members.length; i++) {
                                        members += `${i + 1}. ${resp.data.response.members[i].firstName} ${resp.data.response.members[i].lastName} ^`
                                    }
                                }
                                else {
                                    members += transMessages(array[2]).noMember
                                }



                                response_ = transformCommand(command, members, "B")

                                res.set('Content-type', 'text/xml')
                                res.send(xml(response_, true));
                                res.end
                            }).catch((error) => {
                                console.log(error)
                            })
                        }).catch((error) => {
                            console.log(error)
                        })

                    }
                }
                if (array[4] == "3") {
                    response_ = transformCommand(command, transMessages(array[2]).size, "C")

                    res.set('Content-type', 'text/xml')
                    res.send(xml(response_, true));
                    res.end

                }


                if (array.length == 6 && array[4] == "2") {
                    const options = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'upi': array[5],
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
                                    'documentNumber': array[3],
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
                                        'memberDocumentNumber': array[3],
                                        'phoneNumber': command.msisdn[0].slice(2)
                                    })
                                };

                                console.log(JSON.stringify({
                                    "householdId": resp.data.response.id,
                                    "villageCode": _villageCode,
                                    'upi': upiInfo.upi,
                                    'latitude': upiInfo.centralCoordinate.lat,
                                    'longitude': upiInfo.centralCoordinate.lon,
                                    'userType': 'CITIZEN',
                                    'event': "REQUEST",
                                    'memberDocumentNumber': array[3],
                                    'phoneNumber': command.msisdn[0].slice(2)
                                }))

                                axios.request(options_).then(function (response) {
                                    console.log(response.data.response)
                                    if (response.data.status == true) {
                                        var transMessage = transMessages(array[2]).received;
                                    }
                                    else {
                                        var transMessage = transMessages(array[2]).failed;
                                    }
                                    response_ = transformCommand(command, transMessage, "B")

                                    res.set('Content-type', 'text/xml')
                                    res.send(xml(response_, true));
                                    res.end
                                }).catch(function (error) {
                                    console.error(error);
                                });
                            }).catch((error) => {
                                console.log(error)
                            })




                        }
                        else {
                            response_ = transformCommand(command, transMessages(array[2]).wrongUpi, "B")

                            res.set('Content-type', 'text/xml')
                            res.send(xml(response_, true));
                            res.end
                        }
                    }).catch((error) => {
                        console.log(error)
                    })

                }

            }



            if (array.length === 7) {


                if (array[4] == "3") {

                    const options = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'documentNumber': array[3],
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
                                "documentNumber": array[3],
                                "option": array[5] == 1 ? "PERSONAL_INFO" : (array[5] == 2 ? "ENROLLED_PROGRAM" : "SOCIAL_ECONOMIC"),
                                "description": array[6],
                                "householdID": resp.data.response.id,
                                'phoneNumber': command.msisdn[0].slice(2)
                            })
                        };


                        axios.request(options_).then(function (response) {
                            console.log(response.data)
                            if (response.data.status == true) {
                                var appealMessage = transMessages(array[2]).received;
                            }
                            else {
                                var appealMessage = transMessages(array[2]).failed;
                            }
                            response_ = transformCommand(command, appealMessage, "B")

                            res.set('Content-type', 'text/xml')
                            res.send(xml(response_, true));
                            res.end
                        }).catch(function (error) {
                            console.error(error);
                        });
                    }).catch((error) => {
                        console.log(error)
                    })

                }
            }
        
}

module.exports = ussdWorker;