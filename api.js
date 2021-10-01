
const express = require('express');

const app = express();

const TOKEN = process.env.TOKEN;
const URL = process.env.URL;

app.get('/', function(request, response) {
    response.send('twitter space api');
});


app.get('/api/twitter', async(req, res) => {
    var rq = require('request-promise');

    res.set({"Access-Control-Allow-Origin" : `${URL}`});

    var header = {"Authorization" : `Bearer ${TOKEN}`};
    
    var reqUrl = "https://api.twitter.com/2/spaces/search?query=" + req.query.text
                    + "&state=live&space.fields=participant_count,title,updated_at&expansions=creator_id&user.fields=username,profile_image_url"
    
    let bool = true;
    
    var jsonget = function(uri, header) {
        var options = {
            'method': 'GET',
            'headers': header,
            transform2xxOnly: true, 
            transform: function (body) {
                return JSON.parse(body);
            },
        };
        return rq(uri, options);
    }

    let jsonResult = "defult";

    await jsonget(encodeURI(reqUrl),header)
    .then(function (json) {
        console.log(json);
        jsonResult = json;
        bool = true;
    })
    .catch(function (err) {
        bool = false;
        console.log("api.js error : " + err);
        jsonResult = "api.js error : " + err;
    });

    var usernot = jsonResult.errors;
    if(bool) {
        if(usernot == undefined) {
            console.log("no error");
            jsonResult = spaceResult(jsonResult);

        }else {
            console.log("error");
            jsonResult = errorResult(jsonResult,usernot);
        }
    }

    res.json(jsonResult);

});

function errorResult(result, resultErr) {


    let errornum;
    var creator_id = [];
    var id = [];
    var participant_count = [];
    var title = [];
    var name = [];
    var username = [];
    var profile_image_url = [];
    var updated_at = [];
    var meta = result.meta.result_count - resultErr.length;


    if(meta > 0){
        for(i = 0; i < result.data.length; i++){
            creator_id.push(result.data[i].creator_id);
            id.push(result.data[i].id);
            participant_count.push(result.data[i].participant_count);
            title.push(result.data[i].title);
            updated_at.push(dateChange(result.data[i].updated_at));

        }
        for(i = 0; i < resultErr.length; i++){
            errornum = creator_id.indexOf(resultErr[i].resource_id);
            creator_id.splice(errornum, 1);
            id.splice(errornum, 1);
            participant_count.splice(errornum, 1);
            title.splice(errornum, 1);
            updated_at.splice(errornum, 1);
        }
        for(i = 0; i < result.includes.users.length; i++){
            name.push(result.includes.users[i].name);
            username.push(result.includes.users[i].username);
            profile_image_url.push(result.includes.users[i].profile_image_url);
        }
        return({
            "creator_id": creator_id, "id": id, "participant_count": participant_count, "title": title,
            "updated_at": updated_at, "name": name, "username": username, "profile_image_url": profile_image_url, "meta": meta
        });
    }else {
        return({
            "creator_id": creator_id, "id": id, "participant_count": participant_count, "title": title,
            "updated_at": updated_at, "name": name, "username": username, "profile_image_url": profile_image_url, "meta": 0
        });
    }
}

function spaceResult(result) {
    var creator_id = [];
    var id = [];
    var participant_count = [];
    var title = [];
    var name = [];
    var username = [];
    var profile_image_url = [];
    var updated_at = [];
    var meta = result.meta.result_count;

    if(meta == 0){
        return({
            "creator_id": creator_id, "id": id, "participant_count": participant_count, "title": title,
            "updated_at": updated_at, "name": name, "username": username, "profile_image_url": profile_image_url, "meta": 0
        });
    }

    for(i = 0; i < result.data.length; i++){
        creator_id.push(result.data[i].creator_id);
        id.push(result.data[i].id);
        participant_count.push(result.data[i].participant_count);
        title.push(result.data[i].title);
        updated_at.push(dateChange(result.data[i].updated_at));
        name.push(result.includes.users[i].name);
        username.push(result.includes.users[i].username);
        profile_image_url.push(result.includes.users[i].profile_image_url);
    }
    return({
        "creator_id": creator_id, "id": id, "participant_count": participant_count, "title": title,
        "updated_at": updated_at, "name": name, "username": username, "profile_image_url": profile_image_url, "meta": meta
    });
}

function dateChange(date) {
    var dt = date.split(".");
    date = dt[0] + "Z";
    return date;
}

app.listen(5000, () => console.log('Listening on port 5000'));

console.log("URL: " + `${URL}`);

