const { enableTestMode, getToken, getUserData } = require("./index");

// enableTestMode()

async function main() {
  const token = await getToken("<GIB User>", "<GIB Pass>");
  const user = await getUserData(token);
  console.log(user);
}

main();
