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

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, AccountId};

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
    fn set_get_room() {
        let mut context = get_context(accounts(1), false);
        // Initialize the mocked blockchain
        testing_env!(context.build());

        // Set the testing environment for the subsequent calls
        testing_env!(context.predecessor_account_id(accounts(1)).build());

        let mut contract = Rooms::default();
        contract.set_room("0".to_string(), "first_room".to_string());

        let room_name = contract.get_room("0".to_string());
        assert_eq!(room_name.expect("Don't set room"), "first_room");
    }
}
