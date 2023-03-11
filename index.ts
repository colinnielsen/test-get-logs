// write a function that takes an ethereum event signatuer and does a get logs query with the alchemy provider and returns any events
import { BytesLike, ethers, utils } from "ethers";

const OWNER = process.argv[2] ?? "0xe2B28b58cc5d34872794E861fd1ba1982122B907";

const EVENT = "OwnershipTransferred(address,address)";
const FROM = null;
const TO = OWNER;

export const toTopicString = (
  value: string | number | string[] | number[] | bigint | bigint[]
) => {
  const hashValue = (value: string | number | bigint) =>
    utils.hexZeroPad(value as BytesLike, 32);
  return Array.isArray(value) ? value.map(hashValue) : hashValue(value);
};

async function main() {
  const eventSig = ethers.utils.id(EVENT);
  const provider = new ethers.providers.AlchemyProvider(
    "mainnet",
    "jRS2hx88znXIXy3NkZ90jU240p2hK-HE"
  );
  console.time("getLogs");
  const logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: "latest",
    topics: [
      eventSig,
      FROM ? toTopicString(FROM) : null,
      TO ? toTopicString(TO) : null,
    ],
  });
  console.time("getLogs");
  console.timeLog("getLogs");
  console.log(logs.map((log) => log.address));
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.log(err));
