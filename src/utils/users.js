const users = []
// addUser
const addUser = ({ id, username, room}) => {
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if(!username || !room) {
      return {
          error : 'username and room are required!'
      }
  }

  const existingUser = users.find((user) => {
     return user.username === user && user.room === room
  })

  if(existingUser) {
   return {
       error : 'username is in use!'
   }
  }

  //store user
  const user = {id, username, room}
   users.push(user)
   return {user}
}
// remove user
   const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
   
   if(index !== -1) {
       return users.splice(index, 1)[0]
   }
}
// get user
 const getUser = (id) => {
     return users.find((user) => user.id === id)
 }

 //get users in room
 const getUsersInRoom = (room) => {
     return users.filter((user) => user.room === room)
 }

 module.exports = {
     addUser,
     removeUser,
     getUser,
     getUsersInRoom
 }