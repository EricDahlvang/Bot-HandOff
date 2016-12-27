var express = require('express');
var builder = require('botbuilder');
var app = express();
var checkIn = {};



//=========================================================
// Bot Setup
//=========================================================

// Setup Express Server
app.listen(process.env.port || process.env.PORT || 3978, '::', () => {
    console.log('Server Up');
});
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
app.post('/api/messages', [connector.listen(), function (req, res, next) {
    console.log(req);
    console.log(res);
}]);

// Create endpoint for agent / call center
app.use('/agent', express.static('public'));


var connectorQueue = function (deets) {

    console.log(deets);
    checkIn[deets.user.id] = deets;
    for (addy in Object.keys(checkIn)) {
        if (addy !== deets.user.id) {
            console.log(checkIn);

            return checkIn[addy];
        }
    }


}

//=========================================================
// Bots Dialogs
//=========================================================

var emergencies = ["Health", "Crime", "Catastrophe"];

bot.dialog('/', [
    //welcome the user, ask the emergency
    function (session, args, next) {
        var temp = connectorQueue(session.message.address);
        session.privateConversationData.connect = temp;
        next();

        // session.replaceDialog('/chats');

        // builder.Prompts.choice(session, "What's the emergency?", emergencies);
    }, function (session, args, next) {
        console.log(session.privateConversationData.connect);
        if (session.message.text !== 'break') {
            bot.send(
                new builder.Message()
                    .text(session.message.text)
                    .address(session.privateConversationData.connect));
        } else {
            session.endConversation('bye');
        }

    }
    // //work with selected emergency
    // function (session, results) {
    //     session.userData.emergency = results.response.entity;
    //     switch (session.userData.emergency) {
    //         case emergencies[0]:
    //             session.send(emergencies[0]);
    //             session.replaceDialog('/Health');
    //             break;
    //         case emergencies[1]:
    //             session.send(emergencies[1]);
    //             break;
    //         case emergencies[2]:
    //             session.send(emergencies[2]);
    //             break;
    //         default:
    //     }
    // }
]);

bot.dialog('/chats', [
    function (session, args, next) {
        if (session.message.text !== 'break') {


            bot.send(
                new builder.Message()
                    .text(session.message.text)
                    .address(session.privateConversationData.connect));
        } else {
            session.endConversation('bye');
        }
    }
])

//health conversation
bot.dialog('/Health', [
    function (session) {
        builder.Prompts.text(session, "What type of pain are you experiencing");
    },
    //figure out the type of emergency. Later use LUIS to get the emergency
    function (session, results) {
        if (results.response.includes("chest")) {
            session.userData.painType = "Chest Pain";
            builder.Prompts.choice(session, "How severe is the pain?", ["Mild", "Sharp", "Severe"]);
        } else {
            builder.Prompts.text(session, "I can only help diagnosing chestpain & headache");
            session.endConversation();
        }
    },
    function (session, results) {
        session.userData.painLevel = results.response.entity;
        switch (session.userData.painLevel) {
            case "Mild":
            case "Sharp":
                session.send("Fetching your heartrate");
                session.endConversation();

                break;
            case "Severe":
                session.send("Connecting to a Professional");
                session.endConversation();

                break;
            default:
                session.endConversation();

            //no default case required as the framework handles invalid inputs
            //and prompts the user to enter a valid input
        }
    }
]);
