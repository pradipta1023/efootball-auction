const playersContent = await Deno.readTextFile("./players.txt");
const players = JSON.parse(playersContent);

console.log(players);

// for (const player in players) {
//   console.log(`<${"=".repeat(25)} ${playersOfPosition} ${"=".repeat(25)}>`);
//   for (const player of a[playersOfPosition]) {
//     console.table(player);
//     prompt("Next");
//     console.clear();
//   }
// }
