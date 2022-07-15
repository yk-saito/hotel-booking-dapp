use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, json_types::U128, near_bindgen, AccountId};

#[near_bindgen]
#[derive(Serialize, Deserialize, Debug, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Room {
    name: String,
    image: String,
    description: String,
    location: String,
    price: U128,
    owner: AccountId,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Rooms {
    pub rooms: UnorderedMap<String, Room>,
}

impl Default for Rooms {
    fn default() -> Self {
        Self {
            rooms: UnorderedMap::new(b"r".to_vec()),
        }
    }
}

#[near_bindgen]
impl Rooms {
    pub fn set_room(
        &mut self,
        id: String,
        name: String,
        image: String,
        description: String,
        location: String,
        price: U128,
    ) {
        // Error if already registered
        assert!(self.rooms.get(&id).is_none(), "Already exists");

        let account_id = env::signer_account_id();

        self.rooms.insert(
            &id,
            &Room {
                name,
                image,
                description,
                location,
                price,
                owner: account_id,
            },
        );
    }

    // #[result_serializer(borsh)] // TODO: If I don't need it, DELETE
    pub fn get_room(&self, id: String) -> Room {
        self.rooms.get(&id).expect("No Room")
    }

    // #[result_serializer(borsh)] // TODO: If I don't need it, DELETE
    pub fn get_rooms(&self) -> Vec<Room> {
        Vec::from_iter(self.rooms.values())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, AccountId};

    fn near_to_yocto(near_amount: u128) -> U128 {
        U128(near_amount * 10u128.pow(24))
    }

    // Allows for modifying the environment of the mocked blockchain
    fn get_context(predecessor_account_id: AccountId, is_view: bool) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id)
            .is_view(is_view);
        builder
    }

    #[test]
    fn set_then_get_room() {
        let mut context = get_context(accounts(1), false);
        // Initialize the mocked blockchain
        testing_env!(context.build());

        // Set the testing environment for the subsequent calls
        testing_env!(context.predecessor_account_id(accounts(1)).build());

        let mut contract = Rooms::default();
        contract.set_room(
            "0".to_string(),
            "first_room".to_string(),
            "test.img".to_string(),
            "This is First room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );

        let room = contract.get_room("0".to_string());
        assert_eq!(room.name, "first_room",);
    }

    #[test]
    fn set_then_get_rooms() {
        let mut context = get_context(accounts(1), false);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(1)).build());

        let mut contract = Rooms::default();
        contract.set_room(
            "0".to_string(),
            "first_room".to_string(),
            "test.img".to_string(),
            "This is First room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        contract.set_room(
            "1".to_string(),
            "second_room".to_string(),
            "test2.img".to_string(),
            "This is Second room".to_string(),
            "USA".to_string(),
            near_to_yocto(10),
        );

        let rooms = contract.get_rooms();
        let first_room = rooms.get(0);
        // Convert Option<Room> to Room
        let room_name = first_room.map(|room| &room.name);
        println!("{:?}", room_name);
        assert_eq!(room_name.expect("Don't set room"), "first_room",);

        let second_room = rooms.get(1);
        let room_name = second_room.map(|room| &room.name);
        println!("{:?}", room_name);
        assert_eq!(room_name.expect("Don't set room"), "second_room",);
    }
}
