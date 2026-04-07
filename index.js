const express = require('express');
const { WebClient } = require('@slack/web-api');
const fetch = require('node-fetch');

const app = express();
app.use(express.urlencoded({ extended: true }));

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const VIDEO_URL = process.env.VIDEO_URL;

app.post('/sale', async (req, res) => {
  const channelId = req.body.channel_id;
  res.status(200).send('');

  const videoRes = await fetch(VIDEO_URL);
  const buffer = await videoRes.buffer();

  await slack.filesUploadV2({
    channel_id: channelId,
    filename: 'sale.mp4',
    file: buffer,
    initial_comment: '🎉 SALE CLOSED!',
  });
});

app.listen(3000, () => console.log('Bot running'));
