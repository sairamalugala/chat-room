const users = [];

module.exports = {
    users,
    addUser(user){
        users.push(user);
    },
    removeUser(id){
        const index = users.findIndex((user) => {
            return user.id===id;
        });

        if(index!=-1){
            const user = users[index]
            users.splice(index, 1);
            return user;
        }
        return;
    },
    getUser(id){
        const user = users.find((user)=>{
            return user.id==id;
        });
        if(user){
            return user;
        }
        return;
    },
    getUerFromRoom(roomname){
        const usersInRoom = users.filter((user) => {
            return user.roomname==roomname;
        });
        return usersInRoom;
    }
}