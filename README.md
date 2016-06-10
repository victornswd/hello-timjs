# hello-timjs

Progressive Web App Demo for tim.js


### Running

You will need to have a [GCM](https://developers.google.com/cloud-messaging/)/
[FCM](https://firebase.google.com/docs/cloud-messaging/) project and then get
your `sender_id` and API key. More info on that
[here](https://developers.google.com/cloud-messaging/gcm#table1)

To make this work you will need to change the `gcm_sender_id` in `manifest.json`
with your project's `gcm_sender_id`.

To start the server run `GCM_API_KEY=<YOUR_API_KEY> npm start`

