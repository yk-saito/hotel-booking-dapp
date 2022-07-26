use std::collections::HashMap;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
// use near_sdk::collections::UnorderedSet;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BookedRoom {
    id: String,
    name: String,
    checkin_date: String,
    guest_id: AccountId,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Room {
    id: String, // Timestamp
    name: String,
    image: String,
    description: String,
    location: String,
    price: U128,
    owner_id: AccountId,
    booked_info: HashMap<String, AccountId>, // checkin-date: guest_id
}

#[derive(Serialize, Deserialize, Debug, BorshSerialize, BorshDeserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct JsonRoom {
    id: String, // Timestamp
    name: String,
    image: String,
    description: String,
    location: String,
    price: U128,
    owner_id: AccountId,
    booked_date: Vec<String>, // 日付でサーチするときに欲しい
}

#[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct HotelBooking {
    hotels: HashMap<AccountId, HashMap<String, Room>>,
}

impl Default for HotelBooking {
    fn default() -> Self {
        Self {
            hotels: HashMap::new(),
        }
    }
}

#[near_bindgen]
impl HotelBooking {
    pub fn set_room(
        &mut self,
        timestamp: String,
        name: String,
        image: String,
        description: String,
        location: String,
        price: U128,
    ) -> bool {
        let owner_id = env::signer_account_id();
        let new_room = Room {
            id: timestamp,
            name,
            image,
            description,
            location,
            price,
            owner_id: owner_id.clone(),
            booked_info: HashMap::new(),
        };

        // get_mut: キーに対応する値へのミュータブルリファレンスを返す。
        match self.hotels.get_mut(&owner_id) {
            //既にホテルが登録されている時
            Some(hotel) => {
                let existing = hotel.insert(new_room.name.clone(), new_room);
                if !(existing.is_none()) {
                    return false;
                }
                true
            }
            // まだホテル自体が未登録だった時
            None => {
                let mut new_hotel_room = HashMap::new();
                new_hotel_room.insert(new_room.name.clone(), new_room);
                let _ = self.hotels.insert(owner_id.clone(), new_hotel_room);
                true
            }
        };
        true
    }

    pub fn delete_booked_info(&mut self, room_name: String, checkin_date: String) {
        let owner_id = env::signer_account_id();
        let hotel = self.hotels.get_mut(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        let room = hotel.get_mut(&room_name).expect("ERR_NOT_FOUND_ROOM");

        room.booked_info
            .remove(&checkin_date)
            .expect("ERR_NOT_FOUND_DATE");
    }

    pub fn get_all_rooms(&self) -> Vec<JsonRoom> {
        let mut all_rooms = vec![];

        for (_, hotel) in self.hotels.iter() {
            for (_, room) in hotel {
                let json_room = self.create_json_room(room);
                all_rooms.push(json_room);
            }
        }
        all_rooms
    }

    pub fn get_hotel_rooms(&self, owner_id: AccountId) -> Vec<JsonRoom> {
        let mut hotel_rooms = vec![];
        match self.hotels.get(&owner_id) {
            Some(hotel) => {
                for (_, room) in hotel {
                    hotel_rooms.push(self.create_json_room(room));
                }
                hotel_rooms
            }
            None => hotel_rooms,
        }
    }

    pub fn get_json_room(&self, owner_id: AccountId, room_name: String) -> JsonRoom {
        let hotel = self.hotels.get(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        let room = hotel.get(&room_name).expect("ERR_NOT_FOUND_ROOM");
        let json_room = self.create_json_room(&room);

        println!("\n\nROOM: {:?}\n\n", json_room);
        json_room
    }

    pub fn get_booked_rooms(&self, owner_id: AccountId) -> Vec<BookedRoom> {
        let mut booked_rooms = vec![];

        match self.hotels.get(&owner_id) {
            Some(hotel) => {
                for (_, room) in hotel {
                    if room.booked_info.len() == 0 {
                        continue;
                    }
                    for (date, guest_id) in room.booked_info.clone() {
                        let booked_room = BookedRoom {
                            id: room.id.clone(),
                            name: room.name.clone(),
                            checkin_date: date,
                            guest_id: guest_id,
                        };
                        booked_rooms.push(booked_room);
                    }
                }
                booked_rooms
            }
            None => booked_rooms,
        }
    }

    /*
        return booking JsonRoom
    */
    #[payable]
    pub fn book_room(
        &mut self,
        owner_id: AccountId,
        room_name: String,
        checkin_date: String,
    ) -> bool {
        // 予約する部屋を取得
        let mut hotel = self
            .hotels
            .get_mut(&owner_id.clone())
            .expect("ERR_NOT_FOUND_HOTEL");
        let mut room = hotel
            .get_mut(&room_name.clone())
            .expect("ERR_NOT_FOUND_ROOM");

        let account_id = env::signer_account_id();
        let deposit = env::attached_deposit();
        let room_price: u128 = room.price.clone().into();
        if deposit != room_price {
            return false;
        }

        // 予約が入った日付, guestを登録
        room.booked_info.insert(checkin_date, account_id);

        // トークンを送信
        Promise::new(owner_id.clone()).transfer(deposit);
        true
    }
}

impl HotelBooking {
    pub fn create_json_room(&self, room: &Room) -> JsonRoom {
        let mut booked_date = vec![];
        for (date, _) in room.booked_info.clone() {
            booked_date.push(date);
        }

        let json_room = JsonRoom {
            id: room.id.clone(),
            name: room.name.clone(),
            image: room.image.clone(),
            description: room.description.clone(),
            location: room.location.clone(),
            price: room.price,
            owner_id: room.owner_id.clone(),
            booked_date: booked_date,
        };
        json_room
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn near_to_yocto(near_amount: u128) -> U128 {
        U128(near_amount * 10u128.pow(24))
    }

    // Allows for modifying the environment of the mocked blockchain
    fn get_context(is_view: bool) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .account_balance(0)
            .attached_deposit(0)
            .current_account_id(accounts(0))
            .predecessor_account_id(accounts(0))
            .signer_account_id(accounts(1))
            .is_view(is_view);
        builder
    }

    #[test]
    fn set_then_get_room() {
        let mut context = get_context(false);
        // Initialize the mocked blockchain
        testing_env!(context.build());

        // Set the testing environment for the subsequent calls
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = HotelBooking::default();
        let is_success = contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        assert_eq!(is_success, true);

        let all_rooms = contract.get_all_rooms();
        // println!("\nALL_ROOMS: {:?}\n", all_rooms);
        assert_eq!(all_rooms.len(), 1);

        let owner_id = env::signer_account_id();
        let rooms = contract.get_hotel_rooms(owner_id);
        // println!("\nHOTEL_ROOMS: {:?}\n", hotel_rooms);
        assert_eq!(rooms.len(), 1);
    }

    #[test]
    fn set_then_get_rooms() {
        let mut context = get_context(false);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = HotelBooking::default();
        let _ = contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        let _ = contract.set_room(
            "1".to_string(),
            "USA_room".to_string(),
            "test2.img".to_string(),
            "This is USA room".to_string(),
            "USA".to_string(),
            near_to_yocto(10),
        );

        let all_rooms = contract.get_all_rooms();
        // println!("\nALL_ROOMS: {:?}\n", all_rooms);
        assert_eq!(all_rooms.len(), 2);

        let owner_id = env::signer_account_id();
        let rooms = contract.get_hotel_rooms(owner_id);
        // println!("\nHOTEL_ROOMS: {:?}\n", rooms);
        assert_eq!(rooms.len(), 2);

        // ここで使用するaccountsの指定に注意。環境設定でsigner_account_idにaccounts(1)を指定しているので、それ以外（〜6)を指定すること。
        let error_owner_id = accounts(2);
        let error_rooms = contract.get_hotel_rooms(error_owner_id);
        assert_eq!(error_rooms.len(), 0);
    }

    #[test]
    fn empty_get_rooms() {
        let mut context = get_context(true);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());
        let contract = HotelBooking::default();
        let rooms = contract.get_all_rooms();
        assert_eq!(rooms.len(), 0);
    }

    #[test]
    // hotel owner: alice(accounts(0))
    // booking guest: bob(accounts(1))
    fn book_room_then_get_booked_list() {
        let mut context = get_context(false);

        context.account_balance(near_to_yocto(2).into());
        context.attached_deposit(near_to_yocto(1).into());

        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let hotel_owner_id = env::signer_account_id();
        let room_name = String::from("JAPAN_room");
        let mut contract = HotelBooking::default();
        let _ = contract.set_room(
            "0".to_string(),
            room_name.clone(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(1),
        );
        let _ = contract.set_room(
            "1".to_string(),
            "USA_room".to_string(),
            "test2.img".to_string(),
            "This is USA room".to_string(),
            "USA".to_string(),
            near_to_yocto(1),
        );
        let rooms = contract.get_all_rooms();
        assert_eq!(rooms.len(), 2);

        // let available_room = contract.get_json_room(hotel_owner_id.clone(), room_name.clone());
        // assert_eq!(available_room.status, RoomStatus::Available);
        let is_success = contract.book_room(
            hotel_owner_id.clone(),
            room_name.clone(),
            "2022-08-20".to_string(),
        );
        assert_eq!(is_success, true);
        // let booking_room = contract.get_json_room(hotel_owner_id.clone(), room_name);
        // assert_eq!(
        //     booking_room.status,
        //     RoomStatus::Booked {
        //         guest: hotel_owner_id,
        //         checkin_date: "2022-08-20".to_string()
        //     }
        // );

        let booked_rooms = contract.get_booked_rooms(hotel_owner_id.clone());
        println!("{:?}", booked_rooms);
        assert_eq!(booked_rooms.len(), 1);
    }

    #[test]
    fn err_set_same_room() {
        let mut context = get_context(false);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = HotelBooking::default();
        let _ = contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        let is_success = contract.set_room(
            "1".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        assert_eq!(is_success, false);

        let owner_id = env::signer_account_id();
        let rooms = contract.get_hotel_rooms(owner_id);
        assert_eq!(rooms.len(), 1);
    }
}
