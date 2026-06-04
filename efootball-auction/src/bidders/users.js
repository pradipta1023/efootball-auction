import { input } from "@inquirer/prompts";

const green = (text) => `\x1b[33m${text}\x1b[0m`;

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const getUserDetails = async (countOfUsers) => {
  const users = [];

  for (let i = 0; i < countOfUsers; i++) {
    console.clear();
    displayHead();

    console.log(`ENTER DETAILS FOR BIDDER #${i}`);
    const name = await input({ message: "Team name\n>" });
    users.push({ id: i, name, purseRemaining: 4000, players: [] });
    console.log(
      `\nTeam ${green(name)} with id ${i} registered`,
    );
    await delay(1000);
  }

  return users;
};

const getNoOfUsers = () => {
  console.log("  [?] How many bidders are joining today?");
  const noOfUsers = prompt("> ");
  const noOfUsersInNumber = Number(noOfUsers);
  return Number.isInteger(noOfUsersInNumber)
    ? noOfUsersInNumber
    : getNoOfUsers();
};

const displayHead = () => {
  console.log("=".repeat(50));
  console.log("    📋 A U C T I O N R E G I S T R A T I O N");
  console.log("=".repeat(50));
  console.log("\n");
};

const main = async () => {
  displayHead();
  const countOfUsers = getNoOfUsers();
  const users = await getUserDetails(countOfUsers);
  await Deno.writeTextFile("../data/users.txt", JSON.stringify(users));
  console.log({ users });
};

await main();
