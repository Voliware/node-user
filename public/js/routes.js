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
        return fetch("/user/login", {
            method: "post",
            body: {username, password}
        });
    }
    static logout(){
        return fetch("/user/logout", {method: "post"});
    }
    static register(email, password, username){
        let body = JSON.stringify({email, password, username});
        return fetch("/user/register", {
            method: "post",
            body: body
        });
    }
    static resetPassword(){
        return fetch("/user/reset", {method: "post"});
    }
}