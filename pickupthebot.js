#!/usr/bin/env nodejs
// -*- mode: JavaScript; js-indent-level: 2

const BotKit = require('botkit');
const Conf = require('conf');
const DocOpt = require('docopt');
const Mustache = require('mustache');
const ShellQuote = require('shell-quote');

const config = new Conf({
  configName: 'pickupthebot',
});


const controller = BotKit.slackbot({
  debug: process.env.DEBUG,
  retry: 10,
});

function getSlackToken() {
  return config.get('slack.token') || process.env.SLACK_TOKEN;
}

if (!getSlackToken()) {
  console.error('Error: Missing SLACK_TOKEN in environment');
  process.exit(1);
};

function spawnSlackbot(controller, args) {
  controller.log('Connecting...')
  const defaults = {
    token: getSlackToken(),
  };
  return controller
    .spawn(Object.assign(defaults, args))
    .startRTM();
}


function docopt(doc, message, args) {
  return DocOpt.docopt(doc, {
    argv: ShellQuote.parse(message.text),
    exit: false,
    help: false});
}

function renderUsage(bot, doc, context) {
  var usage = doc
      .replace(/^Usage:/i, '*Usage:*')
      .replace(/^ +/gim, '>')
      .replace(/\b([A-Z-]+)\b/g, '_$1_');
  return Mustache.render(
    usage,
    Object.assign({botname: bot.identity.name}, context || {}));
}

spawnSlackbot(controller);

controller.hears(['^help'], 'direct_message,direct_mention,mention',
  function onHelp(bot, message) {
    const USAGE = `
Usage:
  @{{botname}} help
  @{{botname}} info
  @{{botname}} quit
  @{{botname}} reconnect
  @{{botname}} hipchat help
  @{{botname}} yammer help
`.trim();
    var opts = docopt(USAGE, message);
    if (opts.help) {
      bot.reply(message, renderUsage(bot, USAGE));
      return;
    }
  });


controller.hears(['^info'], 'direct_message,direct_mention,mention',
  function onInfo(bot, message) {
    // foo
  });


controller.hears(['^quit'], 'direct_message,direct_mention,mention',
  function onQuit(bot, message) {
    controller.log('Quitting...')
    process.exit(0);
  });


controller.hears(['^reconnect'], 'direct_message,direct_mention,mention',
  function onReconnect(bot, message) {
    controller.log('Disconnecting...')
    bot.destroy();
    bot = spawnSlackbot(controller);
  });


controller.hears(['^hipchat'], 'direct_message,direct_mention,mention',
  function onHipchat(bot, message) {
    const USAGE = `
Usage:
  @{{botname}} hipchat help
  @{{botname}} hipchat info
  @{{botname}} hipchat connect API-KEY
  @{{botname}} hipchat disconnect
`.trim();
    var opts = docopt(USAGE, message);
    if (opts.help) {
      bot.reply(message, renderUsage(bot, USAGE));
      return;
    }
  });


controller.hears(['^yammer'], 'direct_message,direct_mention,mention',
  function onYammer(bot, message) {
    const USAGE = `
Usage:
  @{{botname}} yammer help
  @{{botname}} yammer info
  @{{botname}} yammer connect API-KEY
  @{{botname}} yammer disconnect
`.trim();
    var opts = docopt(USAGE, message);
    if (opts.help) {
      bot.reply(message, renderUsage(bot, USAGE));
      return;
    }
  });
