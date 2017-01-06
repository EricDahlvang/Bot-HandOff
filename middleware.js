module.exports = {

    incoming: function (message, bot, builder) {
        console.log('conversations/state')
        console.log(global.conversations);
        console.log('************');
        console.log('users');
        console.log(global.users);
        console.log('agents');
        console.log(global.agent);

        if (message.text) { // saves a ping from adding a user/agent

            if (message.text === 'help') {
                // user initiated connect to agent
                global.conversations[message.address.conversation.id] = Object.assign({}, global.conversations[message.address.conversation.id], { 'status': 'Finding_Agent' });
                message.text = 'hold on while I connect you';
                // return message
            } else if (message.text === 'done') {
                global.conversations[message.address.conversation.id] = Object.assign({}, global.conversations[message.address.conversation.id], { 'status': 'Disconnect_From_Agent' });
            }

            // find out who is talking / add new convo if not found
            if (message.user.isStaff) { // move logic to an API for agents
                console.log('is staff');
                var agentId = message.address.conversation.id;
                var thisAgent = global.conversations[agentId];
                if (typeof thisAgent === 'undefined') { // agent not in state yet, add them ****This will happen for each conversation, not agent.
                    global.agent.push(agentId);
                    global.conversations[agentId] = { address: message.address };
                }
            }
            // End Agent

            // Setting User state logic
            else {
                console.log('not staff');
                var userId = message.address.conversation.id;
                var thisUser = global.conversations[userId];
                // Add a user not yet in state

                if (typeof thisUser === 'undefined') {
                    console.log('got undefined');
                    global.users.push(userId);
                    global.conversations[userId] = { transcript: [message], address: message.address, status: 'Talking_To_Bot' };
                    return
                } else {
                    // thisUser = Object.assign({}, thisUser, { 'transcript': })
                    // get spread operator? 
                    global.conversations[userId].transcript.push(message);
                }
                // if in state, update transcript for the user

                // Check for choices to be made
                console.log('about to make the switch')
                console.log(thisUser.status);
                switch (thisUser.status) {
                    case 'Finding_Agent':
                        var msg = new builder.Message()
                            .address(message.address)
                            .text('Please hold while I find an agent');
                        bot.send(msg);
                        var myAgent = global.conversations[global.agent[0]];
                        thisUser = Object.assign({}, thisUser, { agentAddress: myAgent.address, 'status': 'Talking_To_Agent' });
                        global.conversations[userId] = thisUser;
                        message.type = 'invisible';
                        return message;
                        break;
                    case 'Talking_To_Agent':
                        message.text = 'talking to agent';
                        var msg = new builder.Message()
                            .address(global.conversations[userId].agentAddress)
                            .text(message.text);
                        bot.send(msg);
                        message.type = 'invisible';
                        return message;
                        break;
                    case 'Talking_To_Bot':
                        message.text = 'talk to bot';
                        global.conversations[userId] = thisUser;
                        return message;
                        break;
                    case 'Disconnect_From_Agent':
                        message.text = 'done talking to agent';
                        delete global.conversations[userId].agentAddress;
                        bot.beginDialog('/');
                        break;
                    default:
                        message.text = 'defaulting';
                        return message;
                        break;

                }

            }
        }
        // if talking to Agent/waiting for agent, suppress default bot functionality (how if on a prompt and it's looking for a certain response? override somehow)
    }
}
