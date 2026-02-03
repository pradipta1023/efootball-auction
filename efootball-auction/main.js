import { input, select } from "@inquirer/prompts";

const validateBid = /^[1-9][0-9]*/;

const loadPlayersData = async () => {
  const playersContent = await Deno.readTextFile("./data/players.txt");
  return JSON.parse(playersContent);
};

const loadUsers = async () => {
  const users = await Deno.readTextFile("./data/users.txt");
  return JSON.parse(users);
};

const auctionHeader = () => {
  console.log("#".repeat(60));
  console.log("              ⚽  L I V E   A U C T I O N  ⚽");
  console.log("#".repeat(60));
};

const displayPlayer = (player) => {
  console.log("=".repeat(60));
  console.log(`             👤 P L A Y E R        : ${player.name}`);
  console.log(`             💰 B A S E  P R I C E : ${player.mv}`);
  console.log(`             ⚽ P O S I T I O N    : ${player.position}`);
  console.log("=".repeat(60));
};

const displayBidDetails = (currentBid, topBidder, users) => {
  const bidder = getUser(topBidder, users);
  let bidderName = "No bidders yet";
  if (bidder) bidderName = bidder.name;
  console.log("-".repeat(60));
  console.log(" 💰 BIDDING STATUS\n");
  console.log(` 💵 Current Bid    :      ${currentBid}`);
  console.log(` 🔨 Highest Bidder :      ${bidderName}`);
  console.log("-".repeat(60));
};

const getUser = (userId, users) => users.find((user) => user.id === userId);

const getChoices = (users, userId) => {
  const choices = [];
  for (const user of users) {
    const choice = {
      name: user.name,
      value: user,
      disabled: user.id === userId,
    };
    choices.push(choice);
  }
  return choices;
};

const getUserId = async (users, id) => {
  const choices = getChoices(users, id);
  const user = await select({
    message: "Select the user",
    choices,
    pageSize: choices.length,
  });

  return user;
};

const bidPlacingInterface = () => {
  console.log("=".repeat(60));
  console.log("               ⤴ P L A C E   Y O U R   B I D");
  console.log("=".repeat(60));
};

const displayHighestBid = (currentBid) => {
  console.log("-".repeat(60));
  console.log(` 💰 Current Highest : ${currentBid}`);
  console.log("-".repeat(60), "\n");
};

const handleUser = async (topBidder, currentBid, users) => {
  auctionHeader();
  bidPlacingInterface();
  const newBidder = await getUserId(users, topBidder);
  displayHighestBid(currentBid);
  console.log("  [?] Enter the amount want to add to bid");
  const nextBid = Number(
    await input({ message: "> ", validate: (str) => validateBid.test(str) }),
  ) || 5;
  const purse = newBidder.purseRemaining;
  if (purse < currentBid + nextBid) {
    console.log("> Not enough money to buy", {
      bidTried: currentBid + nextBid,
      purse,
    });
    await select({ message: "", choices: [{ name: "back", value: "" }] });
    return [topBidder, currentBid];
  }
  currentBid += nextBid;
  return [newBidder.id, currentBid];
};

const header = (str) => {
  console.log("=".repeat(60));
  console.log(`              ${str}`);
  console.log(`${"=".repeat(60)} \n`);
};

const soldMessage = (player, user, soldAt) => {
  header("🔨  P L A Y E R   S O L D   🔨");
  console.log("*".repeat(60));
  console.log("          🎉  C O N G R A T U L A T I O N S  🎉");
  console.log(`${"=".repeat(60)} \n`);
  console.log(`${player}\nhas been sold to: ${user.name}\n`);
  console.log(`Final Bid : ${soldAt}`);
  console.log("*".repeat(60));
};

const unsoldMessage = (player) => {
  header("❌  P L A Y E R   U N S O L D");
  console.log(` Name       : ${player.name}\n Base Price : ${player.mv}`);
  console.log("\n ‼️ No bids were placed for this Player");
  console.log("=".repeat(60));
};

const displayTeamHeader = (user) => {
  console.log(
    `${
      "-".repeat(60)
    }\n     Team      : ${user.name}\n     Purse Left: ${user.purseRemaining}\n${
      "-".repeat(60)
    }\n`,
  );
};

const createPlayerTable = (players) => {
  const playersTable = [];
  for (const player of players) {
    playersTable.push({
      name: player.player.name,
      position: player.player.position,
      ["sold at"]: player["sold at"],
    });
  }
  return playersTable;
};

const list = async (users) => {
  header("L I S T  O F  P L A Y E R S");
  for (const user of users) {
    displayTeamHeader(user);
    const playersTable = createPlayerTable(user.players);

    if (user.players.length === 0) {
      console.log(`   ${user.name} hasn't bought any player`);
    } else {
      console.table(playersTable);
    }
    console.log("-".repeat(60));
  }
  await select({ message: "", choices: [{ name: "back", value: "" }] });
};

const bid = async (player, users) => {
  let topBidder = null;
  let currentBid = Number(player.mv);
  while (true) {
    console.clear();
    auctionHeader();
    displayPlayer(player);
    displayBidDetails(currentBid, topBidder, users);
    const choice = await select({
      message: "Select your choice: ",
      choices: [
        {
          name: "--> 1. ⤴  place bid",
          value: "1",
        },
        {
          name: "--> 2. 🔒 lock bid",
          value: "2",
        },
        {
          name: "--> 3. 📝 List",
          value: "3",
        },
      ],
    });
    if (choice === "2") break;
    if (choice === "3") {
      console.clear();
      await list(users);
    }
    if (choice === "1") {
      console.clear();
      [topBidder, currentBid] = await handleUser(topBidder, currentBid, users);
    }
  }
  console.clear();
  if (topBidder !== null) {
    soldMessage(player.name, getUser(topBidder, users), currentBid);
    users[topBidder].purseRemaining -= currentBid;
    users[topBidder].players.push({ player, ["sold at"]: currentBid });
  } else {
    unsoldMessage(player);
  }
  await select({ message: "", choices: [{ name: "next", value: "" }] });
};

const run = async (playersData, users) => {
  for (const position in playersData) {
    for (const player of playersData[position]) {
      await bid(player, users);
    }
  }
};

const main = async () => {
  const playersData = await loadPlayersData();
  const users = await loadUsers();
  await run(playersData, users);
  console.log({ playersData, users });
};

await main();
