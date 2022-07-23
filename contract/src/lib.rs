use std::collections::HashMap;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum RoomStatus {
    Available,
    Booked { guest: AccountId },
}

#[derive(Serialize, Deserialize, Debug, BorshSerialize, BorshDeserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Room {
    id: String, // Timestamp
    name: String,
    image: String,
    description: String,
    location: String,
    price: U128,
    owner_id: AccountId,
    status: RoomStatus,
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
    ) {
        let owner_id = env::signer_account_id();
        let new_room = Room {
            id: timestamp,
            name,
            image,
            description,
            location,
            price,
            owner_id: owner_id.clone(),
            status: RoomStatus::Available,
        };

        // get_mut: キーに対応する値へのミュータブルリファレンスを返す。
        match self.hotels.get_mut(&owner_id) {
            //既にホテルが登録されている時
            Some(hotel) => {
                println!("HOTEL {:?}", hotel); // TODO: delete
                let existing = hotel.insert(new_room.name.clone(), new_room);
                println!("\n\nHOTEL_AFTER {:?}", hotel); // TODO: delete
                assert!(existing.is_none(), "ERR_ROOM_ALREADY_EXIST");
            }
            // まだホテル自体が未登録だった時
            None => {
                let mut new_hotel_room = HashMap::new();
                new_hotel_room.insert(new_room.name.clone(), new_room);
                let _ = self.hotels.insert(owner_id.clone(), new_hotel_room);
            }
        };
    }

    pub fn get_all_rooms(&self) -> Vec<&Room> {
        Vec::from_iter(self.hotels.values().flat_map(|hotel| hotel.values()))
    }

    pub fn get_hotel_rooms(&self, owner_id: AccountId) -> Vec<&Room> {
        match self.hotels.get(&owner_id) {
            Some(hotel) => Vec::from_iter(hotel.values()),
            None => vec![],
        }
    }

    pub fn get_room(&self, owner_id: AccountId, room_name: String) -> &Room {
        let hotel = self.hotels.get(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        hotel.get(&room_name).expect("ERR_NOT_FOUND_ROOM")
    }

    /*
        return booking Room
    */
    #[payable]
    pub fn book_room(&mut self, owner_id: AccountId, room_name: String) {
        let room = self.get_room(owner_id.clone(), room_name.clone());

        let account_id = env::signer_account_id();
        let deposit = env::attached_deposit();
        assert!(
            deposit == room.price.clone().into(),
            "ERR_DEPOSIT_NOT_EQUAL_PRICE"
        );

        // ステータスを変更する
        let hotel = self.hotels.get_mut(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        let mut room = hotel.get_mut(&room_name).expect("ERR_NOT_FOUND_ROOM");
        room.status = RoomStatus::Booked { guest: account_id };

        // 送金clear
        Promise::new(owner_id.clone()).transfer(deposit);
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
        contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );

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
        contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        contract.set_room(
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
    fn book_room_then_get_booked_list() {
        let mut context = get_context(false);

        context.account_balance(near_to_yocto(2).into());
        context.attached_deposit(near_to_yocto(1).into());

        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let hotel_owner_id = env::signer_account_id();
        let room_name = String::from("JAPAN_room");
        let mut contract = HotelBooking::default();
        contract.set_room(
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

        // TODO: 要確認
        // このコメントアウト外してテストすると`error[E0502]: cannot borrow `contract` as mutable because it is also borrowed as immutable`

        // let available_room = contract.get_room(hotel_owner_id.clone(), room_name.clone());
        // assert_eq!(available_room.status, RoomStatus::Available);
        let _ = contract.book_room(hotel_owner_id.clone(), room_name.clone());
        let booking_room = contract.get_room(hotel_owner_id.clone(), room_name);
        println!("STATUS: {:?}", booking_room.status); // TODO: delete
        assert_eq!(
            booking_room.status,
            RoomStatus::Booked {
                guest: hotel_owner_id
            }
        );
    }
}
