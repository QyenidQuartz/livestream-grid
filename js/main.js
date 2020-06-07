const SOURCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwy_RmqgnDQiYnzJDpvQA3t_q1XgJB42L1PrzDj9yLhhoSf899fH51fSnIaWwNNX1qELmyH9I2qQhc/pub?output=csv"

const csv = require("csvtojson");

function string_to_slug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    let from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    let to = "aaaaeeeeiiiioooouuuunc------";
    for (let i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

function fetchChart(path) {
    // using a CORS proxy because Sheets doesn't let you use cross-origin unless the document is published :(

    return fetch(`https://cors-anywhere.herokuapp.com/${path}`, {
        "headers": {
            "Origin": "https://butts"
        }
    })
        .then((f) => f.text());
}

function doParse(data) {
    return csv({output: 'json'})
        .fromString(data);
}

function update(content) {
    generate_current_city(content)
    generate_city_list(content)
    document.getElementById("content").innerHTML = ""
    content.forEach((row) => {
        publish_row(filter_city_streams(row));
    });
}

function filter_city_streams(row) {
    return city_filter(embed_filter(live_filter(woke_filter(row))))
}

function filter_online_streams(row) {
    return embed_filter(live_filter(woke_filter(row)))
}

function woke_filter(row) {
    if (row) {

        if (row["Source"] === "Woke" || row["Source"] === "Submit links:") {

        } else {
            return row
        }
    }
}

function live_filter(row) {
    if (row && row["Status"] === "Live") {
        return row
    }
}

function embed_filter(row) {
    if (row && row["Embed Link"]) {
        return row
    }
}

function city_filter(row) {
    let city = window.location.hash.substring(1)
    if (row) {
        if (city) {
            if (string_to_slug(row["City"]) === city) {
                return row
            }
        } else {
            return row
        }
    }
}

function gather_cities(content) {
    let cities;
    console.log("gather_cities");
    cities = [];
    content.forEach((row) => {
        if (filter_online_streams(row)) {
            cities.push(row["City"])
        }
    });
    return new Set(cities)
}

function generate_current_city(content) {
    let city_empty = true
    content.forEach((row) => {
        if (window.location.hash.substring(1) === string_to_slug(row["City"])) {
            document.getElementById('current-city').innerHTML = `Current City Filter: ${row["City"]}`
            city_empty = false
        }

    });
    if (city_empty) {
        document.getElementById('current-city').innerHTML = `Current City Filter: (none)`;
    }
}

function generate_city_list(content) {
    let cities = gather_cities(content);
    cities.forEach((city) => {
        document.getElementById("city-menu").innerHTML += `<a class="dropdown-item" href="#${string_to_slug(city)}">${city}</a>`
    });
}

function publish_row(row) {
    if (row) {
        document.getElementById("content").innerHTML += `<div class="col-3 embed-responsive embed-responsive-16by9 m-0 p-0"><iframe class="embed-responsive-item ${string_to_slug(row["City"])} ${string_to_slug(row["State"])}" src="${row["Embed Link"]}"></iframe><p class="source">${row["Source"]} - ${row["City"]}, ${row["State"]}</p></div><br />`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchChart(SOURCE_URL).then(doParse).then(update);
});

window.addEventListener('popstate', () => {
    fetchChart(SOURCE_URL).then(doParse).then(update);
});
