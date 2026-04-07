const express = require('express');
const { WebClient } = require('@slack/web-api');
const fetch = require('node-fetch');

const app = express();
app.use(express.urlencoded({ extended: true }));

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const VIDEO_URL = process.env.VIDEO_URL;

app.post('/sale', async (req, res) => {
  const channelId = req.body.channel_id;
  const userId = req.body.user_id;

  try {
    await slack.conversations.join({ channel: channelId });
  } catch (e) {
    // Private channel - check if bot is already a member
    try {
      const info = await slack.conversations.info({ channel: channelId });
      if (!info.channel.is_member) {
        // Bot not in channel - send ephemeral message only visible to the user who typed /sale
        await slack.chat.postEphemeral({
          channel: channelId,
          user: userId,
          text: '👋 To use /sale in a private channel, please type `/invite @Operate Sale Bot` first, then try again.',
        });
        return;
      }
    } catch (e2) {
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
});

app.listen(3000, () => console.log('Bot running'));
