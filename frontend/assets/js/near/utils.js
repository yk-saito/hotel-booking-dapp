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
      viewMethods: ["get_all_rooms", "get_hotel_rooms", "get_room"],
      changeMethods: ["set_room", "book_room", "change_status_to_available"],
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

export async function get_all_rooms() {
  let all_rooms = await window.contract.get_all_rooms();
  return all_rooms;
}

export async function get_hotel_rooms(owner_id) {
  let hotel_rooms = await window.contract.get_hotel_rooms({
    owner_id: owner_id,
  });
  return hotel_rooms;
}

export async function get_room(owner_id, room_name) {
  let room = await window.contract.get_room({
    owner_id: owner_id,
    room_name: room_name,
  });
  return room;
}

export function set_room(room) {
  console.log(room);
  const timestamp = Date.now().toString();
  console.log("timestamp: ", timestamp);
  room.price = parseNearAmount(room.price + "");
  let is_success = window.contract.set_room({
    timestamp: timestamp,
    name: room.name,
    image: room.image,
    description: room.description,
    location: room.location,
    price: room.price,
  });
  return is_success;
}

export async function book_room({ owner_id, room_name, date, price }) {
  console.log("book_room date: ", date);
  let is_success = await window.contract.book_room(
    { owner_id: owner_id, room_name: room_name, checkin_date: date },
    GAS,
    price
  );
  return is_success;
}

export async function change_status_to_available(room_name) {
  console.log("in utils.js: ", room_name);
  await window.contract.change_status_to_available({
    room_name: room_name,
  });
}
