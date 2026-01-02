const express = require("express");
const noblox = require("noblox.js");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

/* ===== CONFIG ===== */
const GROUP_ID = 123456789; // YOUR GROUP ID
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;
/* ================== */

async function startBot() {
  if (!ROBLOX_COOKIE) {
    console.error("ROBLOX_COOKIE is NOT set in Replit Secrets");
    process.exit(1);
  }

  try {
    await noblox.setCookie(ROBLOX_COOKIE);
    const user = await noblox.getCurrentUser();
    console.log("Logged in as:", user.UserName);
  } catch (err) {
    console.error("Failed to login:", err);
    process.exit(1);
  }
}

startBot();

/*
POST /rank
{
  "command": "promote | demote | setrank",
  "username": "RobloxUsername",
  "role": "RoleName" // only for setrank
}
*/
app.post("/rank", async (req, res) => {
  const { command, username, role } = req.body;

  if (!command || !username) {
    return res.status(400).json({ error: "Missing command or username" });
  }

  try {
    const userId = await noblox.getIdFromUsername(username);

    if (command === "promote") {
      await noblox.promote(GROUP_ID, userId);
    } 
    else if (command === "demote") {
      await noblox.demote(GROUP_ID, userId);
    } 
    else if (command === "setrank") {
      if (!role) throw "Role missing";
      const roles = await noblox.getRoles(GROUP_ID);
      const targetRole = roles.find(r => r.name === role);
      if (!targetRole) throw "Role not found";
      await noblox.setRank(GROUP_ID, userId, targetRole.rank);
    } 
    else {
      throw "Invalid command";
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(3000, () => {
  console.log("Roblox rank bot running on port 3000");
});
