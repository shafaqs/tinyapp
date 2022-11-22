// 
const getUserByEmail = (email, database) => {
  for (let keyID in database) {
    if (database[keyID].email === email) return database[keyID];
  }
  return null;
};
module.exports = { getUserByEmail };