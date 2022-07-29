use std::collections::HashMap;
use std::vec;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct UseTime {
    check_in: String,
    check_out: String,
}

#[derive(Serialize, Deserialize, Debug, BorshSerialize, BorshDeserialize, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum UsageStatus {
    Available,
    Stay { check_in_date: String },
}

#[derive(Serialize, Deserialize, Debug, BorshSerialize, BorshDeserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ResigteredRoom {
    name: String,
    use_time: UseTime,
    image: String,
    description: String,
    location: String,
    price: U128,
    status: UsageStatus,
    owner_id: AccountId,
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BookedRoom {
    name: String,
    check_in_date: String,
    guest_id: AccountId,
    status: UsageStatus,
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AvailableRoom {
    owner_id: AccountId,
    room_name: String,
    use_time: UseTime,
    image: String,
    description: String,
    location: String,
    price: U128,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Room {
    name: String,
    use_time: UseTime,
    image: String,
    description: String,
    location: String,
    price: U128,
    owner_id: AccountId,
    status: UsageStatus,
    booked_info: HashMap<String, AccountId>, // checkin-date: guest_id
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
        name: String,
        check_in: String,
        check_out: String,
        image: String,
        description: String,
        location: String,
        price: U128,
    ) -> bool {
        let owner_id = env::signer_account_id();
        let use_time = UseTime {
            check_in,
            check_out,
        };
        let new_room = Room {
            name,
            use_time: use_time,
            image,
            description,
            location,
            price,
            status: UsageStatus::Available,
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

    pub fn change_status_to_available(&mut self, room_name: String, check_in_date: String) {
        let owner_id = env::signer_account_id();
        let hotel = self.hotels.get_mut(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        let room = hotel.get_mut(&room_name).expect("ERR_NOT_FOUND_ROOM");

        room.booked_info
            .remove(&check_in_date)
            .expect("ERR_NOT_FOUND_DATE");

        room.status = UsageStatus::Available;
    }

    pub fn change_status_to_stay(&mut self, room_name: String, check_in_date: String) {
        let owner_id = env::signer_account_id();
        let hotel = self.hotels.get_mut(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        let room = hotel.get_mut(&room_name).expect("ERR_NOT_FOUND_ROOM");

        room.status = UsageStatus::Stay { check_in_date };
    }

    pub fn is_available(&self, owner_id: AccountId, room_name: String) -> bool {
        let hotel = self.hotels.get(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        let room = hotel.get(&room_name).expect("ERR_NOT_FOUND_ROOM");
        if room.status != UsageStatus::Available {
            return false;
        }
        true
    }

    pub fn get_available_rooms(&self, check_in_date: String) -> Vec<AvailableRoom> {
        // for 全ホテル
        let mut available_rooms = vec![];

        for (_, hotel) in self.hotels.iter() {
            for (_, room) in hotel {
                match room.booked_info.get(&check_in_date) {
                    Some(_) => continue,
                    None => {
                        let use_time = UseTime {
                            check_in: room.use_time.check_in.clone(),
                            check_out: room.use_time.check_out.clone(),
                        };
                        let available_room = AvailableRoom {
                            owner_id: room.owner_id.clone(),
                            room_name: room.name.clone(),
                            use_time: use_time,
                            image: room.image.clone(),
                            description: room.description.clone(),
                            location: room.location.clone(),
                            price: room.price,
                        };
                        available_rooms.push(available_room);
                    }
                }
            }
        }
        available_rooms
    }

    pub fn get_hotel_rooms(&self, owner_id: AccountId) -> Vec<ResigteredRoom> {
        let mut hotel_rooms = vec![];
        match self.hotels.get(&owner_id) {
            Some(hotel) => {
                for (_, room) in hotel {
                    hotel_rooms.push(self.create_resigtered_room(room));
                }
                hotel_rooms
            }
            None => hotel_rooms,
        }
    }

    pub fn get_resigtered_room(&self, owner_id: AccountId, room_name: String) -> ResigteredRoom {
        let hotel = self.hotels.get(&owner_id).expect("ERR_NOT_FOUND_HOTEL");
        let room = hotel.get(&room_name).expect("ERR_NOT_FOUND_ROOM");
        let resigtered_room = self.create_resigtered_room(&room);

        println!("\n\nROOM: {:?}\n\n", resigtered_room);
        resigtered_room
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
                        let status: UsageStatus;
                        match room.status {
                            UsageStatus::Available => status = UsageStatus::Available,
                            UsageStatus::Stay { ref check_in_date } => {
                                if date == check_in_date.clone() {
                                    status = UsageStatus::Stay {
                                        check_in_date: check_in_date.clone(),
                                    }
                                } else {
                                    status = UsageStatus::Available;
                                }
                            }
                        }
                        let booked_room = BookedRoom {
                            name: room.name.clone(),
                            check_in_date: date,
                            guest_id: guest_id,
                            status: status,
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
        return booking ResigteredRoom
    */
    #[payable]
    pub fn book_room(
        &mut self,
        owner_id: AccountId,
        room_name: String,
        check_in_date: String,
    ) -> bool {
        // 予約する部屋を取得
        let hotel = self
            .hotels
            .get_mut(&owner_id.clone())
            .expect("ERR_NOT_FOUND_HOTEL");
        let room = hotel
            .get_mut(&room_name.clone())
            .expect("ERR_NOT_FOUND_ROOM");

        let account_id = env::signer_account_id();
        let deposit = env::attached_deposit();
        let room_price: u128 = room.price.clone().into();
        if deposit != room_price {
            return false;
        }

        // 予約が入った日付, guestを登録
        room.booked_info.insert(check_in_date, account_id);

        // トークンを送信
        Promise::new(owner_id.clone()).transfer(deposit);
        true
    }
}

impl HotelBooking {
    pub fn create_resigtered_room(&self, room: &Room) -> ResigteredRoom {
        let use_time = UseTime {
            check_in: room.use_time.check_in.clone(),
            check_out: room.use_time.check_out.clone(),
        };

        // statusを複製
        let status: UsageStatus;
        match room.status {
            UsageStatus::Available => status = UsageStatus::Available,
            UsageStatus::Stay { ref check_in_date } => {
                status = UsageStatus::Stay {
                    check_in_date: check_in_date.clone(),
                }
            }
        }

        let resigtered_room = ResigteredRoom {
            name: room.name.clone(),
            use_time: use_time,
            image: room.image.clone(),
            description: room.description.clone(),
            location: room.location.clone(),
            price: room.price,
            status: status,
            owner_id: room.owner_id.clone(),
            // booked_date: booked_date,
        };
        resigtered_room
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
    fn owner_set_then_get_room() {
        let mut context = get_context(false);
        // Initialize the mocked blockchain
        testing_env!(context.build());

        // Set the testing environment for the subsequent calls
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = HotelBooking::default();
        let is_success = contract.set_room(
            "14:00".to_string(),
            "10:00".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        assert_eq!(is_success, true);

        let owner_id = env::signer_account_id();
        let all_rooms = contract.get_hotel_rooms(owner_id);
        // println!("\nALL_ROOMS: {:?}\n", all_rooms);
        assert_eq!(all_rooms.len(), 1);
    }

    #[test]
    fn owner_set_then_get_rooms() {
        let mut context = get_context(false);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = HotelBooking::default();
        let _ = contract.set_room(
            "JAPAN_room".to_string(),
            "14:00".to_string(),
            "10:00".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        let _ = contract.set_room(
            "USA_room".to_string(),
            "14:00".to_string(),
            "10:00".to_string(),
            "test2.img".to_string(),
            "This is USA room".to_string(),
            "USA".to_string(),
            near_to_yocto(10),
        );

        let owner_id = env::signer_account_id();
        let rooms = contract.get_hotel_rooms(owner_id);
        // println!("\nHOTEL_ROOMS: {:?}\n", rooms);
        assert_eq!(rooms.len(), 2);
    }

    #[test]
    fn owner_empty_get_rooms() {
        let mut context = get_context(true);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());
        let contract = HotelBooking::default();

        // ここで使用するaccountsの指定に注意。環境設定でsigner_account_idにaccounts(1)を指定しているので、それ以外（〜6)を指定すること。
        let error_owner_id = accounts(2);
        let error_rooms = contract.get_hotel_rooms(error_owner_id);
        assert_eq!(error_rooms.len(), 0);
    }

    #[test]
    // hotel owner: bob(accounts(1))
    // booking guest: charlie(accounts(2))
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
            room_name.clone(),
            "14:00".to_string(),
            "10:00".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(1),
        );
        let _ = contract.set_room(
            "USA_room".to_string(),
            "14:00".to_string(),
            "10:00".to_string(),
            "test2.img".to_string(),
            "This is USA room".to_string(),
            "USA".to_string(),
            near_to_yocto(1),
        );
        let rooms = contract.get_hotel_rooms(hotel_owner_id.clone());
        assert_eq!(rooms.len(), 2);

        // Search check
        testing_env!(context.signer_account_id(accounts(2)).build());
        let check_in_date: String = "2222-01-01".to_string();
        let available_rooms = contract.get_available_rooms(check_in_date.clone());
        println!("\n\nAVAILABLE_ROOM: {:?}\n\n", available_rooms);
        assert_eq!(available_rooms.len(), 2);

        // let available_room = contract.get_resigtered_room(hotel_owner_id.clone(), room_name.clone());
        // assert_eq!(available_room.status, RoomStatus::Available);

        let is_success = contract.book_room(
            hotel_owner_id.clone(),
            room_name.clone(),
            check_in_date.clone(),
        );
        assert_eq!(is_success, true);

        let booked_rooms = contract.get_booked_rooms(hotel_owner_id.clone());
        println!("{:?}", booked_rooms);
        assert_eq!(booked_rooms.len(), 1);
        assert_eq!(booked_rooms[0].check_in_date, check_in_date);
        println!(
            "guest{:?} signer{:?}",
            booked_rooms[0].guest_id,
            env::signer_account_id()
        );
        assert_eq!(booked_rooms[0].guest_id, accounts(2));

        //TEST
        // ホテルのオーナーにアカウントを切り替え
        testing_env!(context.signer_account_id(accounts(1)).build());
        contract.change_status_to_stay(room_name.clone(), check_in_date.clone());
        let rooms = contract.get_hotel_rooms(hotel_owner_id.clone());
    }

    #[test]
    fn err_set_same_room() {
        let mut context = get_context(false);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = HotelBooking::default();
        let _ = contract.set_room(
            "JAPAN_room".to_string(),
            "14:00".to_string(),
            "10:00".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        let is_success = contract.set_room(
            "JAPAN_room".to_string(),
            "14:00".to_string(),
            "10:00".to_string(),
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
