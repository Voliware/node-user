class Routes {
    static getUsers(){
        return fetch("/users")
            .catch(function(err){
                console.error(err);
            });
    }
    static getUser(userId){
        return fetch(`/user/${userId}`)
            .catch(function(err){
                console.error(err);
            });
    }
    static addUser(user){
        let body = JSON.stringify(user);
        return fetch("/user", {
            method: "post",
            body: body
        }).catch(function(err){
            console.error(err);
        });
    }
    static deleteUser(userId){
        return fetch(`/user/${userId}`, {
            method: "delete"
        }).catch(function(err){
            console.error(err);
        });
    }
    static updateUser(user){
        let body = JSON.stringify(user);
        return fetch("/user", {
            method: "put",
            body: body
        }).catch(function(err){
            console.error(err);
        });
    }
    static login(data){
        let body = JSON.stringify(data);
        return fetch("/user/login", {
            method: "post",
            body: body
        }).catch(function(err){
            console.error(err);
        });
    }
    static logout(){
        return fetch("/user/logout", {
            method: "post"
        }).catch(function(err){
            console.error(err);
        });
    }
    static register(user){
        let body = JSON.stringify(user);
        return fetch("/user/register", {
            method: "post",
            body: body
        }).catch(function(err){
            console.error(err);
        });
    }
    static resetPassword(email){
        let body = JSON.stringify({email});
        return fetch("/user/reset", {
            method: "post",
            body: body
        }).catch(function(err){
            console.error(err);
        });
    }
}