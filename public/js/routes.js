class Routes {
    static getUsers(){
        return fetch("/users");
    }
    static getUser(userId){
        return fetch(`/user/${userId}`)
    }
    static addUser(user){
        return fetch("/user", {
            method: "post",
            body: user.toJson()
        });
    }
    static deleteUser(userId){
        return fetch(`/user/${userId}`, {
            method: "delete"
        });
    }
    static updateUser(user){
        return fetch("/user", {
            method: "put",
            body: user.toJson()
        });
    }
    static login(username, password){
        return fetch("/login", {
            method: "post",
            body: {username, password}
        });
    }
    static logout(){
        return fetch("/logout", {method: "post"});
    }
    static register(user){
        return fetch("/register", {
            method: "post",
            body: user.toJson()
        });
    }
    static resetPassword(){
        return fetch("/resetPassword", {method: "post"});
    }
}