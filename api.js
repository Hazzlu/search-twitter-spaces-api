
const express = require('express');

const app = express();

const TOKEN = process.env.TOKEN;
const URL = process.env.URL;
const PORT = process.env.PORT || 5000;

app.get('/', function(request, response) {
    response.send('twitter space api');
});


app.get('/api/twitter', async(req, res) => {
    let rq = require('request-promise');

    res.set({"Access-Control-Allow-Origin" : `${URL}`});

    let header = {"Authorization" : `Bearer ${TOKEN}`};
    
    let reqUri = "https://api.twitter.com/2/spaces/search?query=" + req.query.text
                    + "&state=live&space.fields=participant_count,title,updated_at&expansions=creator_id&user.fields=username,profile_image_url"
    
    let bool = true;
    
    let jsonget = function(uri, header) {
        let options = {
            'method': 'GET',
            'headers': header,
            transform2xxOnly: true, 
            transform: function (body) {
                return JSON.parse(body);
            },
        };
        return rq(uri, options);
    }

    let jsonResult;

    await jsonget(encodeURI(reqUri),header)
    .then(function (json) {
        console.log(json);
        jsonResult = json;
        console.log(json.includes.users);
        bool = true;
    })
    .catch(function (err) {
        console.log("meta: " + jsonResult);
        if(jsonResult.meta.result_count != 0) {
            bool = false;
            console.log("api.js error : " + err);
            jsonResult = "api.js error : " + err;
        }
        
    });

    //Check if there is a space hosted by private accounts
    let usernot = jsonResult.errors;
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
    let creator_id = [];
    let id = [];
    let participant_count = [];
    let title = [];
    let name = [];
    let username = [];
    let profile_image_url = [];
    let updated_at = [];
    let meta = result.meta.result_count - resultErr.length;
    let index;


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
        for(i = 0; i < creator_id.length; i++){
            for(j = 0; j < creator_id.length; j++){
                if(result.includes.users[j].id == creator_id[i]){
                    index = j;
                    j = creator_id;
                }
            }
            name.push(result.includes.users[index].name);
            username.push(result.includes.users[index].username);
            profile_image_url.push(result.includes.users[index].profile_image_url);
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
    let creator_id = [];
    let id = [];
    let participant_count = [];
    let title = [];
    let name = [];
    let username = [];
    let profile_image_url = [];
    let updated_at = [];
    let meta = result.meta.result_count;

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
        for(j = 0; j < result.data.length; j++){
            if(result.includes.users[j].id == creator_id[i]){
                index = j;
                j = creator_id;
            }
        }
        name.push(result.includes.users[index].name);
        username.push(result.includes.users[index].username);
        profile_image_url.push(result.includes.users[index].profile_image_url);
    }
    return({
        "creator_id": creator_id, "id": id, "participant_count": participant_count, "title": title,
        "updated_at": updated_at, "name": name, "username": username, "profile_image_url": profile_image_url, "meta": meta
    });
}


//Delete milliseconds
function dateChange(date) {
    let dt = date.split(".");
    date = dt[0] + "Z";　//ISO8601 ends with Z
    return date;
}
console.log("URL: " + `${URL}`);

app.listen(PORT, () => console.log('Listening on port ' + `${PORT}`));



