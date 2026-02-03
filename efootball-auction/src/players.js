import { input } from "@inquirer/prompts";

const validateMV = /^[0-9]+$/;

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const header = () => {
  console.log("=".repeat(62));
  console.log("         📢 A D D  P L A Y E R S  T O  A U C T I O N");
  console.log("=".repeat(62));
};

const positionHeader = (position) => {
  console.log("\n");
  console.log(`          >========= P O S I T I O N : ${position} =========<`);
  console.log("\n");
};

const detailsHeader = () => {
  console.log("            🚨 P L A Y E R ' S  D E T A I L S");
  console.log("=".repeat(62));
};

const getDetails = async () => {
  const name = await input({
    message: "                 Player name\n                   > ",
  });
  const mv = await input({
    message: `                 Market value\n                   > `,
    validate: (mv) => validateMV.test(mv),
  });
  return { name, mv };
};

const playerDetails = async (position) => {
  console.clear();
  header();
  detailsHeader();
  positionHeader(position);
  const details = await getDetails();
  console.log(`⚡️ ${details.name} added to the pool`);
  await delay(1000);
  return { ...details, position };
};

const totalPlayersWanted = async (position) => {
  console.clear();
  header();
  positionHeader(position);
  console.log(`  [?] How many players should be there for ${position}?`);
  const count = await input({ message: "> " });
  const totalNoOfPlayers = Number(count);

  if (Number.isInteger(totalNoOfPlayers) && totalNoOfPlayers !== 0) {
    console.log(" ✅ Validated no. of players");
    await delay(1000);
    return totalNoOfPlayers;
  }

  console.log(" ❌ Invalid no. of players");
  await delay(1000);
  return totalPlayersWanted(position);
};

const getPlayersForPosition = async (position) => {
  const players = [];
  const noOfPlayers = await totalPlayersWanted(position);
  for (let idx = 0; idx < noOfPlayers; idx++) {
    players.push(await playerDetails(position));
  }
  return players;
};

const getPlayers = async () => {
  const playersData = {};
  const defence = ["LB", "RB", "CB"];
  const midField = ["DMF", "CMF", "RMF", "AMF", "LMF"];
  const forward = ["SS", "RWF", "LWF", "CF"];
  const positions = ["GK", ...defence, ...midField, ...forward];

  for (const position of positions) {
    playersData[position] = await getPlayersForPosition(position);
  }

  return playersData;
};

const main = async () => {
  const players = await getPlayers();
  await Deno.writeTextFile("../data/players.txt", JSON.stringify(players));
  console.log(players);
};

await main();
