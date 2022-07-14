use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::near_bindgen;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Rooms {
    pub rooms: UnorderedMap<String, String>,
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
    pub fn set_room(&mut self, id: String, name: String) {
        self.rooms.insert(&id, &name);
    }

    pub fn get_room(&self, id: String) -> Option<String> {
        self.rooms.get(&id)
    }
}
