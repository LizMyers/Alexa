'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = 'amzn1.ask.skill.9b1f74ac-8ba5-4832-ac80-8c4ec34d1514'; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.9b1f74ac-8ba5-4832-ac80-8c4ec34d1514';
var SKILL_NAME = 'Curly Brace';
// var accountID = context.invokedFunctionArn.split(":")[4];
// var region = context.invokedFunctionArn.split(":")[3];
// var sqsURL = "https://sqs." + region + ".amazonaws.com/" + accountID + "/curly-brace-sqs-queue";
//var AWS = require('aws-sdk');
//AWS.config.region = 'us-east-1';
//var sqsURL = 'https://sqs.us-east-1.amazonaws.com/527951812531/sqs_magic_link_2';

//Adding greater variety to startSession
var WELCOME = [
    "Hi there, you can ask me things like how do I get started or what are utterances. Now, how can I help?",
    "Hi, I\'m your new voice teacher .    Ha ha ha - don't worry this isn't about singing. It's about building voice experiences. But enough about me, how can I help?",
    "Hi, you can ask me things like, what are skills or how do I get started. Now, how can I help?",
    "Hello, you can ask me things like how do I get started or what is Lambda. Now how can I help?",
    "Hi there. how can I help?",
    "Hello, I\'m ready to help with basic skill building. What would you like to know?",
    "Hi, I\'m here to help you build skills for Alexa. What would you like to know?",
    "Hi there, you look like you want to ask me something. Please go right ahead.",
    "Hi there, ready to serve. Fire away with your question."
];

//Adding greater variety to endSession
var GOODBYE = [
    "OK, later Dude!",
    "OK, bye for now.",
    "OK, nice chatting - see you later.",
    "You bet! See you later.",
    "OK, no worries. See you later.",
    "OK, no problem. See you later.",
    "OK, see you later.",
    "Sure thing. See you later."
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    //alexa.dynamoDBTableName = 'curlyBrace';
    alexa.registerHandlers(handlers);
    alexa.execute();
};
var handlers = {
    'LaunchRequest': function () {
        var wIndex = Math.floor(Math.random() * WELCOME.length);
        var randomWelcome = WELCOME[wIndex];
        this.attributes['sqsStatus'] = 'OFF';
        // var SqsStatus = this.attributes['sqsStatus'];
        // if (SqsStatus ==='undefined' || SqsStatus == 'ON' ) {
        //     this.attributes['sqsStatus'] = 'ON';
        // } else {
        //     this.attributes['sqsStatus'] = 'OFF';
        // }
        // this.attributes['speechOutput'] = randomWelcome + '  (By the way, SQS is ' + this.attributes['sqsStatus']  + '.) ';
         this.attributes['speechOutput'] = randomWelcome;
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = 'For instructions on what you can say, please say help me.';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'], this.attributes['sqsStatus'])
    },
    'SqsStatusIntent': function() {
            var SqsStatus = this.attributes['sqsStatus'];
            this.attributes['speechOutput'] = 'SQS is  ' + this.attributes['sqsStatus'] + ' .  Did you have a question?';
            this.attributes['repromptSpeech'] = 'Sorry, Did you have a question?';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'GreetingIntent': function () {
        var firstName = this.event.request.intent.slots.FirstName.value;
        console.log(firstName);
        if (firstName) {
            this.attributes['speechOutput'] = 'Hi  ' + firstName + ' , nice to see you.  Did you have a question?';
            this.attributes['repromptSpeech'] = firstName + ', are you still there? Don\'t be shy. Just ask me anything about getting started with Alexa.';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
         }
     },
    'TurnOnSQSIntent': function () {
            this.attributes['sqsStatus'] = 'ON';
            this.attributes['speechOutput'] = 'SQS is on. Did you have a question?';
            this.attributes['repromptSpeech'] = 'Are you still there? Just ask me anything about getting started with Alexa.';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'], this.attributes['sqsStatus']);
     },
    'TurnOffSQSIntent': function () {
            this.attributes['sqsStatus'] = 'OFF';
            this.attributes['speechOutput'] = 'SQS is off. Did you have a question?';
            this.attributes['repromptSpeech'] = 'Are you still there? Just ask me anything about getting started with Alexa.';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'], this.attributes['sqsStatus']);
     },
    'RecipeIntent': function () {
        //check whether SQS is switched ON or OFF and whether we can display 
        //pages with URLs or need recipes that speak URLs aloud.

        var sqsStatus = this.attributes['sqsStatus'];
        console.log("sqsStatusThisEveningIs:=" + sqsStatus);

        if (this.attributes['sqsStatus'] == 'ON') {
            var recipes = require('./recipesFancy');
            console.log("Using fancy recipes");
        } else {
            var recipes = require('./recipesBasic');
            console.log("Using basic recipes");
            this.attributes['sqsStatus']='OFF';
        }

        var itemSlot = this.event.request.intent.slots.Item;
        var itemName, magicLink;
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        //Custom Card Titles
        if (itemName === "utterances" || itemName === "slots"  || itemName === "cards" || itemName === "intents" || itemName === "custom slots" || itemName === "custom slot types" || itemName === "skills"){
             var cardTitle = "What are " + itemName + "?";
        } else if (itemName === "ssml" || itemName === "lambda") {
            var cardTitle = "What is " + itemName.toUpperCase() + "?";
        } else if (itemName === "utterance" || itemName === "intent" || itemName === "intent schema") {
            var cardTitle = "What is an " + itemName + "?";
        } else if (itemName === "slot" || itemName === "custom slot" || itemName === "custom slot type" || itemName === "card") {
            var cardTitle = "What is a " + itemName + "?";
        } else if (itemName === "get skills approved" || itemName === "get my skills approved" || itemName === "get skills published" || itemName === "get my skills published" || itemName === "get skills tested" || itemName === "get my skills tested" || itemName === "get skills certified" || itemName === "get my skills certified") {
            var cardTitle = "How long does it take to " + itemName + "?";
        } else if (itemName === "sample" || itemName === "template" || itemName === "skill") {
            var cardTitle = "Which " + itemName + " should I make?";
        } else if (itemName === "publish flash cards" || itemName === "republish your templates" || itemName === "publish the templates") {
            var cardTitle = "Can I " + itemName + "?";
        } else {
            var cardTitle = "How to " + itemName + "?";
        }

        //figure out what url we need
        if (itemName === "get an aws account" || itemName === "get an aws account") {
            magicLink = "aws.amazon.com";
        } else if (itemName === "get started") {
            magicLink = "bit.ly/alexaquickstart";    
        } else if (itemName === "get a developer account") {
            magicLink = "developer.amazon.com";    
        } else if (itemName === "check in to my event" || itemName === "register for my event") {
            magicLink = "bit.ly/alexacheckin";   
        } else if (itemName === "claim my device" || itemName === "get a device" || itemName === "get a tap" || itemName === "get an echo" || itemName === "get an Amazon device" || itemName === "get my device" || itemName === "get an amazon device") {
            magicLink = "bit.ly/alexabootcamp";            
        } else if (itemName === "get the templates"  || itemName === "find the templates" || itemName === "find the sample templates" || itemName === "get the samples" || itemName === "find the samples" || itemName === "download the samples" || itemName === "download the templates" || itemName === "find the repo" || itemName === "get the sample templates" || itemName === "find the Github samples" || itemName === "find the Github repo") {
            magicLink = "github.com/alexa";   
        } else if (itemName === "make icons") {
            magicLink = "iconion.com";   
        } else if (itemName === "test my skills" || itemName === "test a skill" || itemName === "test my skill") {
            magicLink = "echosim.io";   
        } else if (itemName === "make an http request") {
            magicLink = "github.com/amzn/alexa-skills-kit-js/tree/master/samples/historyBuff/src/index.js";   
        } else if (itemName === "ssml" || itemName === "SSML" || itemName === "Ssml" || itemName === "change your pronunciation" || itemName === "change Alexa's pronunciation" || itemName === "change alexa's pronunciation") {
            magicLink = "developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speech-synthesis-markup-language-ssml-reference";   
        } else if (itemName === "find the training videos") {
            magicLink = "developer.amazon.com/alexa-skills-kit/big-nerd-ranch";   
        } else if (itemName === "get help" || itemName === "get some assistance" || itemName === "get some help") {
            magicLink = "bit.ly/alexaquickstart";  
         } else if (itemName === "setup my device" || itemName === "setup tap" || itemName === "setup echo" || itemName === "setup the tap" || itemName === "setup the echo" || itemName === "setup your device" || itemName === "setup the device") {
            magicLink = "alexa.amazon.com";    
        } else if (itemName === "card" || itemName === "cards") {
            magicLink = "alexa.amazon.com";  
        } else if (itemName === "use audio" || itemName === "use audio clips" || itemName === "work with audio" || itemName === "work with audio clips") {
            magicLink = "vimeo.com/175790470";  
        }

        var recipe = recipes[itemName];
        console.log ("recipe = " + recipe);

         if (recipe !== undefined && this.attributes['sqsStatus'] == 'ON') {
            console.log('sqs: '+this.attributes['sqsStatus']);

        ///////////////////////////////WRITE SQS/////////////////////////////////

                var queueURL = 'https://sqs.us-east-1.amazonaws.com/527951812531/sqs_magic_link_2';
                var queue = new AWS.SQS({params: {QueueUrl: queueURL.toString()}});
                var params = {
                    MessageBody: magicLink
                }
                //this line fixes async problem
                var parentFunction = this;

                queue.sendMessage(params, function (){                
                    console.log('message Sent' );

                    //speakRecipe(recipe);
                    var repromptSpeech = 'If you\'d like to hear the last answer again, you can say repeat. Anything else you need? ';
                    var speechOutput = recipe + ' Anything else you need?';
                    parentFunction.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, recipe);      
                    console.log('after message Sent');
                })

          ///////////////////////////////////////////////////////////////////////////
         //end if recipee && SQS ON
      
         } else if (recipe !== undefined && this.attributes['sqsStatus'] == 'OFF') {
            this.attributes['speechOutput'] = recipe + ' Anything else you need?';
            this.attributes['repromptSpeech'] = 'If you\'d like to hear the last answer again, you can say repeat . Anything else you need? ';
            this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'], cardTitle, recipe);
        } else {
            var speechOutput = 'I\'m sorry, I currently do not know the answer to that ...';
            var repromptSpeech = ' Anything else you need?';

            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = 'You can ask questions like what is Lambda or how do i get started, or you can say stop . Now, how can I help?';
        this.attributes['repromptSpeech'] = 'You say things like what are skills or how do I find the samples . Now, how can I help?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    "AMAZON.NoIntent": function (intent, session, response) {
        var goodbyeIndex = Math.floor(Math.random() * GOODBYE.length);
        var randomGoodbye = GOODBYE[goodbyeIndex];
        this.emit(':tell', randomGoodbye);
    },
    'AMAZON.StopIntent': function () {
        var goodbyeIndex = Math.floor(Math.random() * GOODBYE.length);
        var randomGoodbye = GOODBYE[goodbyeIndex];
        this.emit(':tell', randomGoodbye);
    },
    'AMAZON.CancelIntent': function () {
        var goodbyeIndex = Math.floor(Math.random() * GOODBYE.length);
        var randomGoodbye = GOODBYE[goodbyeIndex];
        this.emit(':tell', randomGoodbye);
    },
    'SessionEndedRequest':function () {
        var goodbyeIndex = Math.floor(Math.random() * GOODBYE.length);
        var randomGoodbye = GOODBYE[goodbyeIndex];
        this.emit(':tell', randomGoodbye);
    }
};