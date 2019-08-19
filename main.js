const Discord = require('discord.js')
const client = new Discord.Client()

const bot_secret_token = process.env.BOT_TOKEN
const slack_webhook_url = process.env.SLACK_WEBHOOK

if (bot_secret_token === "") {
  console.log("Warning, missing bot token")
  return
}

if (slack_webhook_url === "") {
  console.log("Warning, missing slack webhook")
  return
}

const slackWebhook = require('@slack/webhook');
const webhook = new slackWebhook.IncomingWebhook(slack_webhook_url);

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
    console.log("Servers:")
    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name)
        // List all channels
        guild.channels.forEach((channel) => {
          console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
      })
    })
})

client.on('voiceStateUpdate', (oldMember, newMember) => {
  // Here I'm storing the IDs of their voice channels, if available
  let oldChannel = oldMember.voiceChannel ? oldMember.voiceChannel.id : null;
  let newChannel = newMember.voiceChannel ? newMember.voiceChannel.id : null;
  if (oldChannel == newChannel) return; // If there has been no change, exit
  let channelID = newChannel ? newChannel : oldChannel
  let didJoin = newChannel ? true: false;
  let who = oldMember.voiceChannel ? oldMember : newMember;
  let whoName = who.nickname || who.user.username;

  let channel = client.channels.get(channelID)


  const ignoredChannels = [/exec/gmi]
  
  if (ignoredChannels.some((tester) => tester.test(channel.name))) { 
    console.log("bailing, private channel", channel.name)
    return
  }

  const ignoredUsers = [/boni/gmi]
  let ignoredTester = ignoredUsers.find((tester) => tester.test(whoName))
  if (ignoredTester !== undefined) { 
    console.log(`bailing, ignoring user ${whoName} via ${ignoredTester}`)
    return
  }

  let action = didJoin ? "joined" : "left"
  console.log(`user ${who.nickname} ${action} the channel ${channel.name}: avatar: ${who.user.avatarURL}`)

  let link = didJoin ? `<https://discord.gg/7qGEdSQ|Click here> to join!` : ""


  webhook.send({
    text: `${whoName} ${action} the channel _${channel.name}_. ${link}`,
    "username": whoName,
    "icon_url": who.user.avatarURL,
  });


  return
})

client.login(bot_secret_token)
