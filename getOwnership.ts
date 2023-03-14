// write a function that takes an ethereum event signatuer and does a get logs query with the alchemy provider and returns any events
import { BytesLike, Contract, ethers, utils } from "ethers";

const QUERY_ADDR =
  process.argv[2] ?? "0xe2B28b58cc5d34872794E861fd1ba1982122B907";
const DIR = process.argv[3] === "<-" ? "<-" : "->";

const EVENT = "OwnershipTransferred(address,address)";
const TO = DIR === "<-" ? QUERY_ADDR : null;

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

  if (DIR === "<-") {
    console.time("getLogs");
    const logs = await provider.getLogs({
      fromBlock: 0,
      toBlock: "latest",
      topics: [eventSig, null, TO ? toTopicString(TO) : null],
    });

    // todo: owner out logs, reduce across, create a mapping
    console.time("getLogs");
    console.timeLog("getLogs");

    const addresses = logs.map((log) => ({
      partyAddress: log.address,
      counterParty: QUERY_ADDR,
      relationship: "owner<-",
    }));

    console.log(addresses);
  } else {
    try {
      const contract = new Contract(
        QUERY_ADDR,
        ["function owner() public view returns (address)"],
        provider
      );
      const owner = await contract.owner();
      console.log({
        partyAddress: owner,
        counterParty: QUERY_ADDR,
        relationship: "owner->",
      });
      return;
    } catch (e) {}

    try {
      const contract = new Contract(
        QUERY_ADDR,
        ["function getOwners() public view returns (address[])"],
        provider
      );
      const owners: string[] = await contract.getOwners();
      console.log(
        owners.map((owner) => ({
          partyAddress: owner,
          counterParty: QUERY_ADDR,
          relationship: "owner->",
        }))
      );
      return;
    } catch (e) {}
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.log(err));
