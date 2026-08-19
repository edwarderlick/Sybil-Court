import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const ADDRESS = "0x573ae3ba443fc3b5bAA52b9B1030c4eA0c0cf69c";
const read = createClient({ chain: studionet });

function asRecord(value) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value && typeof value === "object") return value;
  return {};
}

async function call(functionName, args = []) {
  return read.readContract({
    address: ADDRESS,
    functionName,
    args,
    jsonSafeReturn: true,
  });
}

const out = {
  eligibleVitalik: asRecord(
    await call("is_eligible", ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]),
  ),
  eligibleHopParent: asRecord(
    await call("is_eligible", ["0xfe7101d155eb11640e5a4bf342cd066dce51e9e3"]),
  ),
  treasury: asRecord(await call("get_treasury")),
  firstSubmitterCredit: asRecord(
    await call("get_credit", ["0x24feBe882b938EF26e5299A0CE84E176342A3269"]),
  ),
  contestedBond: asRecord(await call("get_bond_status", ["CASE-0003"])),
  economics: asRecord(await call("get_economics")),
};
console.log(JSON.stringify(out, null, 2));
