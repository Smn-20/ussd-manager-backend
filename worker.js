const xml = require('xml');
const axios = require('axios');
// const translations  = require('./translation');

// function transMessages(language){
//     let messages;
//     if(language=="1"){
//         messages=translations.ki
//     }
//     else if (language=="2"){
//         messages=translations.en
//     }
//     else if (language=="3"){
//         messages=translations.fr
//     }
//     return messages
// }

// function getLanguage(language){
//     if(language=="1"){
//         return 'rw'
//     }
//     else if (language=="2"){
//         return 'en'
//     }
//     else if (language=="3"){
//         return 'fr'
//     }
// }


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


const ussdWorker = (array,command,res) => {
    console.log(array)
            if (array.length === 2) {
                response_ = transformCommand(command,"Hitamo ururimi ^ 1) Kinyarwanda ^ 2) English ^ 3) Français ^ ", "FB")
                res.set('Content-type', 'text/xml')
                res.send(xml(response_, true));
                res.end
            }        
}

module.exports = ussdWorker;