import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import {
  formatNearAmount,
  parseNearAmount,
} from "near-api-js/lib/utils/format";
import getConfig from "./config";

const GAS = 100000000000000;

const nearConfig = getConfig(process.env.NODE_ENV || "development");
//...

//...
// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      viewMethods: ["get_room", "get_rooms"],
      changeMethods: ["book_room", "set_room"],
    }
  );
}
//...
//...
export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  window.walletConnection.requestSignIn(nearConfig.contractName);
}

export async function accountBalance() {
  return formatNearAmount(
    (await window.walletConnection.account().getAccountBalance()).total,
    2
  );
}

export async function getAccountId() {
  return window.walletConnection.getAccountId();
}

export async function get_rooms() {
  let rooms = await window.contract.get_rooms();
  return rooms;
}

export function createRoom(room /*name, image, description, location, price*/) {
  console.log(room);
  const timestamp = Date.now().toString();
  console.log("timestamp: ", timestamp);
  room.price = parseNearAmount(room.price + "");
  return window.contract.set_room({
    timestamp: timestamp,
    name: room.name,
    image: room.image,
    description: room.description,
    location: room.location,
    price: room.price,
  });
}

export async function book_room({ room_id, price }) {
  await window.contract.book_room({ room_id: room_id }, GAS, price);
}
