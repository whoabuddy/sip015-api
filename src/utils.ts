import {
  AddressStxBalanceResponse,
  Transaction,
} from "@stacks/stacks-blockchain-api-types";
import { StacksMainnet } from "micro-stacks/network";
import throttledQueue from "throttled-queue";

/////////////////////////
// CONSTANTS
/////////////////////////

// logging config
const ENABLE_LOGS = true;

// BTC
// https://explorer.btc.com/btc/adapter?type=api-doc
export const BTC_API = "https://chain.api.btc.com/v3/address/";
export const BTC_ADDRESS_YES = "11111111111111X6zHB1ZC2FmtnqJ";
export const BTC_ADDRESS_NO = "1111111111111117CrbcZgemVNFx8";
export const BTC_VOTE_START = 762550;
export const BTC_VOTE_END = 766750;

// STX
export const STX_NETWORK = new StacksMainnet();
export const STX_API = "https://stacks-node-api.mainnet.stacks.co";
export const STX_ADDRESS_YES = "SP00000000000003SCNSJTCHE66N2PXHX";
export const STX_ADDRESS_NO = "SP00000000000000DSQJTCHE66XE1NHQ";
export const STX_VOTE_START = 82914;
export const STX_VOTE_END = 87114;
export const POX_CONTRACT = "SP000000000000000000002Q6VF78.pox";
export const POX_FUNCTION = "get-stacker-info";

/////////////////////////
// HELPERS
/////////////////////////

// logging
export const dbgLog = (msg: string) => ENABLE_LOGS && console.log(msg);
export const printDivider = () => console.log(`------------------------------`);

// generic queue throttled to 1 request per second
export const throttle = throttledQueue(1, 1000, true);

// throttled fetch that returns JSON on success
export const fetchJson = async (url: string): Promise<any> => {
  dbgLog(`fetchJson: ${url}`);
  const response = await throttle(() => fetch(url));
  if (response.status === 200) {
    const json = await response.json();
    return json;
  }
  throw new Error(
    `fetchJson: ${url} ${response.status} ${response.statusText}`
  );
};

/////////////////////////
// TYPES
/////////////////////////

// KV binding
export interface Env {
  sip015_index: KVNamespace;
}

// transaction list per address
export interface StacksTxList {
  totalProcessed: number;
  totalQueried: number;
  totalResults: number;
  lastUpdated: string;
  results: Transaction[];
}

// vote transactions per voting address
export interface StxVoteTxPerAddress {
  [key: string]: Transaction[];
}

// vote data per voting address
export interface StxVoteDataPerAddress {
  stackingData?: AddressStxBalanceResponse;
  txs?: Transaction[];
}

// vote data per voting address in one object
export interface StxVoteData {
  [key: string]: StxVoteDataPerAddress;
}

export interface StxInvalidVoteReasons {
  [key: string]: string;
}

export interface StxInvalidVoteStats {
  totalInvalidVotes: number;
  totalsByReason: {
    [key: string]: number;
  };
}

// overall vote object, stored in KV
export interface StxVoteMethodData {
  validVotes: StxVoteData;
  invalidVotes: StxVoteData;
  invalidVoteReasons: StxInvalidVoteReasons;
}

// metadata for overall vote object
export interface StxMethodVoteStats {
  lastUpdated: string;
  totalVotes: {
    yes: number;
    no: number;
  };
  totalAmounts: {
    yes: number;
    no: number;
  };
  totalTxs?: {
    yes: number;
    no: number;
  };
}
