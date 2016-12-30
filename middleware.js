module.exports = {

    incoming: function (message, args) {
        console.log(args);
        console.log('agents')
        console.log(global.agents);
        console.log('users');

        console.log(global.users);
        console.log('************');

        // WHERE do we create a user? on first run?
        // WHEN do we update the user's address? Conv id will change.
        // Store by convo id?
        // add message to transcript
        // update last active to help keep track of 'current' convos

        // TODO: this will BREAK with changing convoIds. fix it
        if (message.text) { // only execute on message event
            var userConvo = message.address.conversation.id;
            if (!message.address.user.isStaff && !global.users[userConvo]) {
                console.log('I am adding a new user')
                global.users[userConvo] = new global.User(message);
            } else if (!message.address.user.isStaff) {
                global.users[userConvo].transcript += message.text;
            } else {
                // TODO make real logic around agent
                global.agents[userConvo] = new global.User(message);
            }
        } else if (message.text === 'bot') {
            handoffToBot(message.user.conversation.id);
        }
        return message;
    },

    outgoing: function (message, args) {
        // routing info goes here. 
        // or default to user address, just change if they want to talk to a user?
        // like update addy value. Then we just look for our own entry and route accordingly
        console.log(message.address);
        console.log(args);
        if (global.users[message.address.converation.id].routeMessagesTo) { // route user messages to agent if appropriate. Otherwise send to the bot
            message.address =  global.users[message.address.converation.id].routeMessagesTo;
        }
        console.log('address');
        console.log(message.address);
        console.log('===========');

        return message
    },

    handoffToAgent: function (user) {
        var agent = Object.keys(global.agents);
        // TODO choose how to filter for an agent, or factor out to another method

        //  make agnostic enough that this can pass to agent from bot or another agent
        // keep in mind only letting 1 user talk to 1 agent. 1 agent can talk to many users
        console.log('handoff to agent');
        console.log(agent);

        global.users[user].routeMessagesTo = global.agents[agent[0]].address;


    },
    handoffToBot: function (user) {
        // look up user
        global.users[user].routeMessagesTo = false;

    },

    getCurrentConversations: function () {
        // return all current conversations
    },
    transcribeConversation: function () {
        // store all messages between user/bot user/agent
        // do this in a way that speaker is obvious

    },

    getTranscriptForAgent: function () {
        // end goal is to populate a webchat window so agent seamlessly joins existing conversation

    },




}
