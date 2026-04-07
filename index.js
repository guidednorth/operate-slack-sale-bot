const express = require('express');
const { WebClient } = require('@slack/web-api');
const fetch = require('node-fetch');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const VIDEO_URL = process.env.VIDEO_URL;

app.post('/sale', (req, res) => {
  console.log('Received:', JSON.stringify(req.body));
  const channelId = req.body.channel_id;
  const userId = req.body.user_id;
  res.status(200).send('');
  if (!channelId) {
    console.log('No channel_id found');
    return;
  }
  handleSale(channelId, userId);
});

async function handleSale(channelId, userId) {
  try {
    await slack.conversations.join({ channel: channelId });
  } catch (e) {
    try {
      const info = await slack.conversations.info({ channel: channelId });
      if (!info.channel.is_member) {
        await slack.chat.postEphemeral({
          channel: channelId,
          user: userId,
          text: '👋 To use /sale in a private channel, type `/invite @Operate Sale Bot` first, then try again.',
        });
        return;
      }
    } catch (e2) {
      console.log('Error:', e2.message);
      return;
    }
  }
  const videoRes = await fetch(VIDEO_URL);
  const buffer = await videoRes.buffer();
  await slack.filesUploadV2({
    channel_id: channelId,
    filename: 'sale.mp4',
    file: buffer,
    initial_comment: '🎉 SALE CLOSED!',
  });
}

app.listen(3000, () => console.log('Bot running'));
