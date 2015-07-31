# push-api-demo

This is an attempt to create a simple chatroom example to demonstrate the [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). It also illustrates some uses of [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), and how to use [Channel Messaging](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API) to communicate data between a Service Worker and the main window context.

## Current status

At the moment this demo only works on [Firefox Nightly](https://nightly.mozilla.org/). The working parts are:

* Requesting permission to send notifications/push messages.
* Registering and activating a service worker to handle the Push/Channel Messages.
* Subscribing/unsubscribing (to/from) the push sevice.
* Sending a push message from the server.
* Receiving a push message in the SW via the `onpush` handler and firing a notification as a result.
* Sending messages to and from the SW via a message channel.

Still to do:

* Setting up the Google Cloud Messaging service properly so the example will work in Chrome as well.
* Setting up functionality to allow subscribed users to send messages to the chatroom that will be seen by all subscribed users.
* Hosting the server somewhere on t'internet so it can be accessed by multiple users (a chatroom is pretty useless with only one user!)
* Fixing the service worker so that the data sent in the push messages is read and used (Firefox currently doesn't support the `PushMessageData methods`, see [Bug 1149195](https://bugzilla.mozilla.org/show_bug.cgi?id=1149195) — this is the most serious blocker for now.)


## Running the demo

To get it running:

1. Clone this repo locally (you'll need to [install git](http://www.git-scm.com/downloads), then use the command `git clone https://github.com/chrisdavidmills/push-api-demo.git`)
2. Install [NodeJS](https://nodejs.org/) on your computer.
3. Load the [sample app](https://chrisdavidmills.github.io/push-api-demo/) in Firefox Nightly. Note that it needs to run under HTTPS, as Service workers will only run in a secure context.
4. in your terminal/command line, navigate to the directory that you cloned this repo into, and run the command `node server` to start the same server running. This server is HTTPS, and runs at `127.0.0.1:7000`.
5. Go back to the sample app and play with the subscribe/unsubscribe functionality. Monitor the browser console and terminal window (that the server is running in) to see what is happening. You will also see user information being written into, and removed from, the [endpoint.txt](https://github.com/chrisdavidmills/push-api-demo/blob/gh-pages/endpoint.txt) file as subscribe/unsubscribe commands are issued.

Note: Some of the client-side code in this demo is heavily influenced by Matt Gaunt's excellent examples in [Push Notifications on the Open Web](http://updates.html5rocks.com/2015/03/push-notificatons-on-the-open-web). Thanks for the awesome work Matt!

