/**
 * ViralObj — post_instagram.js
 * Publishes reels to Instagram via Graph API
 *
 * Flow:
 *   1. Upload video container (REELS)
 *   2. Poll until status = FINISHED
 *   3. Publish container
 *   4. Optionally share to Stories
 *
 * Required env vars:
 *   INSTAGRAM_ACCESS_TOKEN  — Long-lived token (60 days)
 *   INSTAGRAM_ACCOUNT_ID    — Instagram Business Account ID
 */

const GRAPH_API = "https://graph.facebook.com/v21.0";

export async function postToInstagram({
  video_url,
  caption_pt,
  caption_en = null,
  hashtags_pt = [],
  hashtags_en = [],
  schedule_time = null,   // ISO string or null for immediate
  share_to_stories = false,
  thumbnail_offset = 2000, // ms offset for thumbnail
  lang = "pt",
}) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!token) throw new Error("INSTAGRAM_ACCESS_TOKEN not set in environment");
  if (!accountId) throw new Error("INSTAGRAM_ACCOUNT_ID not set in environment");
  if (!video_url) throw new Error("video_url is required");

  // — Build caption ———————————————————————————————————————————————————————
  const caption = buildCaption({
    caption_pt,
    caption_en,
    hashtags_pt,
    hashtags_en,
    lang,
  });

  // — Step 1: Create media container ——————————————————————————————————————
  const containerBody = {
    media_type: "REELS",
    video_url,
    caption,
    thumb_offset: thumbnail_offset,
    share_to_feed: true,
  };

  // Schedule for later if requested
  if (schedule_time) {
    const scheduledTimestamp = Math.floor(new Date(schedule_time).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    const minFuture = now + 600; // at least 10 min in the future
    const maxFuture = now + 75 * 24 * 60 * 60; // max 75 days

    if (scheduledTimestamp < minFuture) {
      throw new Error("schedule_time must be at least 10 minutes in the future");
    }
    if (scheduledTimestamp > maxFuture) {
      throw new Error("schedule_time must be within 75 days");
    }

    containerBody.published = false;
    containerBody.scheduled_publish_time = scheduledTimestamp;
  }

  console.error("[1/3] Creating media container...");
  const containerRes = await graphPost(`${accountId}/media`, containerBody, token);
  const containerId = containerRes.id;
  console.error(`   ✅ Container: ${containerId}`);

  // — Step 2: Poll until ready ————————————————————————————————————————————
  console.error("[2/3] Waiting for video processing...");
  const status = await waitForContainer(containerId, token);

  if (status !== "FINISHED") {
    throw new Error(`Container processing failed with status: ${status}`);
  }
  console.error("   ✅ Video processed");

  // — Step 3: Publish —————————————————————————————————————————————————————
  let mediaId;
  if (schedule_time) {
    // Scheduled posts don't need media_publish — they auto-publish
    mediaId = containerId;
    console.error(`[3/3] ✅ Scheduled for ${schedule_time}`);
  } else {
    console.error("[3/3] Publishing...");
    const publishRes = await graphPost(`${accountId}/media_publish`, {
      creation_id: containerId,
    }, token);
    mediaId = publishRes.id;
    console.error(`   ✅ Published: ${mediaId}`);
  }

  // — Optional: Share to Stories ——————————————————————————————————————————
  let storyId = null;
  if (share_to_stories && !schedule_time) {
    try {
      console.error("   📱 Sharing to Stories...");
      const storyRes = await graphPost(`${accountId}/media`, {
        media_type: "STORIES",
        video_url,
      }, token);
      const storyContainerId = storyRes.id;
      await waitForContainer(storyContainerId, token);
      const storyPublish = await graphPost(`${accountId}/media_publish`, {
        creation_id: storyContainerId,
      }, token);
      storyId = storyPublish.id;
      console.error(`   ✅ Story published: ${storyId}`);
    } catch (e) {
      console.error(`   ⚠ Story failed: ${e.message}`);
    }
  }

  // — Build result ————————————————————————————————————————————————————————
  const reelUrl = `https://www.instagram.com/reel/${mediaId}`;

  const summary = schedule_time
    ? `✅ Reel scheduled!

📅 Scheduled for: ${schedule_time}
🆔 Container ID: ${containerId}
📝 Caption: ${caption.substring(0, 100)}...

The reel will be published automatically at the scheduled time.`
    : `✅ Reel published!

🎬 URL: ${reelUrl}
🆔 Media ID: ${mediaId}
${storyId ? `📱 Story ID: ${storyId}` : ""}
📝 Caption: ${caption.substring(0, 100)}...

The reel is now live on Instagram.`;

  return {
    content: [{ type: "text", text: summary }],
    result: {
      media_id: mediaId,
      url: reelUrl,
      story_id: storyId,
      scheduled: !!schedule_time,
      schedule_time: schedule_time || null,
      caption_length: caption.length,
    },
  };
}

// ——— HELPERS ——————————————————————————————————————————————————————————————

function buildCaption({ caption_pt, caption_en, hashtags_pt, hashtags_en, lang }) {
  const parts = [];

  if (lang === "pt" || lang === "both") {
    if (caption_pt) parts.push(caption_pt);
    if (hashtags_pt.length > 0) {
      parts.push("");
      parts.push(hashtags_pt.join(" "));
    }
  }

  if ((lang === "en" || lang === "both") && caption_en) {
    parts.push("");
    parts.push("---");
    parts.push("");
    parts.push(caption_en);
    if (hashtags_en.length > 0) {
      parts.push("");
      parts.push(hashtags_en.join(" "));
    }
  }

  return parts.join("\n");
}

async function graphPost(endpoint, body, token) {
  const url = `${GRAPH_API}/${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Graph API error: ${data.error.message} (code: ${data.error.code})`);
  }

  return data;
}

async function graphGet(endpoint, token) {
  const url = `${GRAPH_API}/${endpoint}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function waitForContainer(containerId, token, maxWait = 300000) {
  const start = Date.now();
  const pollInterval = 5000;

  while (Date.now() - start < maxWait) {
    const data = await graphGet(
      `${containerId}?fields=status_code`,
      token
    );

    const status = data.status_code;
    console.error(`   ⏳ Status: ${status}`);

    if (status === "FINISHED") return "FINISHED";
    if (status === "ERROR") return "ERROR";

    await new Promise(r => setTimeout(r, pollInterval));
  }

  throw new Error("Container processing timed out after 5 minutes");
}
