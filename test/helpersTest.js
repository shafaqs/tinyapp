

const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

// const getUserByEmail = (email, database) => {
//   for (let keyID in database) {
//     if (database[keyID].email === email) return database[keyID];
//   }
//   return null;
// };

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = testUsers["userRandomID"];
    console.log("expectedUserID:", expectedUserID);
    console.log("user:", user);
    assert.equal(expectedUserID, user);

  });
  it('should return undefined with nonexistant email', function() {
    const user = getUserByEmail("nonexist@example.com", testUsers);
    console.log("user2:", user);
    const expectedUserID = undefined;
    assert.equal(expectedUserID, user);
    ;
  });
});
