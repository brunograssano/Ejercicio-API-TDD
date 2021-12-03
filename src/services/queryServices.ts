
interface Filters {
    username?:Object;
    firstName?:Object;
    lastName?:Object;
    email?:Object;
    gender?:Object;
    nickname?:Object;
    contacts?:Object;
    preferences?:Object;
}


interface QuerySearch {
    username?:Object;
    "firstName.value"?:Object;
    "firstName.public"?:Object;
    "lastName.value"?:Object;
    "lastName.public"?:Object;
    "email.value"?:Object;
    "email.public"?:Object;
    "gender.value"?:Object;
    "gender.public"?:Object;
    "nickname.value"?:Object;
    "nickname.public"?:Object;
    "contacts.value"?:Object;
    "contacts.public"?:Object;
    preferences?:Object;
}


export const getSearchQuery = (request: Request) : Object => {
    let searchValues : Filters = request.body as Filters;
    let query : QuerySearch = {};
    if (searchValues == null) {
        return query;
    }

    if(searchValues.username != ""){
        query.username = {"$regex":searchValues.username};
    }

    if(searchValues.firstName != ""){
        query["firstName.value"] = {"$regex":searchValues.firstName};
        query["firstName.public"] = true;
    }

    if(searchValues.lastName != ""){
        query["lastName.value"] = {"$regex":searchValues.lastName};
        query["lastName.public"] = true;
    }

    if(searchValues.email != ""){
        query["email.value"] = {"$regex":searchValues.email};
        query["email.public"] = true;
    }

    if(searchValues.gender != ""){
        query["gender.value"] = {"$regex":searchValues.gender};
        query["gender.public"] = true;
    }

    if(searchValues.nickname != ""){
        query["nickname.value"] = {"$regex":searchValues.nickname};
        query["nickname.public"] = true;
    }

    if(searchValues.contacts != ""){
        query["contacts.value"] = {"$in":searchValues.contacts};
        query["contacts.public"] = true;
    }

/*
    if(searchValues.preferences != []){
        query.preferences = {"$elemMatch":{"value":{"$in":searchValues.preferences},"public":true}};
    }
*/
    console.log(query)

    return query;
}

