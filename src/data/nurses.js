// Fictional nurse directory — demonstration only, NOT authentication.
// Any non-empty username/password is accepted; these IDs just resolve to a name.
const directory = {
  125816: "Asha Shinde",
  125902: "Rohan Pawar",
  126044: "Priya Nair",
};
export const resolveNurse = (username) => ({
  id: username,
  name: directory[username] || username,
  role: "Nurse",
});
