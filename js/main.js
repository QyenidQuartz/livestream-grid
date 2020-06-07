const SOURCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwy_RmqgnDQiYnzJDpvQA3t_q1XgJB42L1PrzDj9yLhhoSf899fH51fSnIaWwNNX1qELmyH9I2qQhc/pub?output=csv"
const MUTE_KEY = "m"
const FOCUS_KEY = "f"

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
    console.log("Update");
    if (null === document.getElementById("city-selector")) {
        console.log("City Selector");
        document.getElementById("city").innerHTML = "" +
            "  <button class=\"btn btn-secondary dropdown-toggle\" type=\"button\" id=\"dropdownMenuButton\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n" +
            "    Filter By City" +
            "  </button>\n" +
            "  <div id=\"city-menu\" class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\"></div></div>"
        let cities = gather_cities(content);
        console.log(cities);
        cities.forEach((city) => {
            console.log(city);
            document.getElementById("city-menu").innerHTML += `<a class="dropdown-item" href="#">${city}</a>`
        });
    }
    console.log("After City UI");
    content.forEach((row) => {
        console.log(`Looking at ${row["Source"]}`);
        publish_row(city_filter(embed_filter(live_filter(woke_filter(row)))));
    });
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
    let city = document.getElementById("city-selection");
    if (row) {
        if (city) {
            if (row["City"] === city) {
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
        cities.push(row["City"])
    });
    return new Set(cities)
}

function publish_row(row) {
    if (row) {
        document.getElementById("content").innerHTML += `<div class="col-auto m-0 p-0"><iframe class="embed-responsive-16by9 ${string_to_slug(row["City"])} ${string_to_slug(row["State"])}" src="${row["Embed Link"]}"></iframe><p class="source">${row["Source"]} - ${row["City"]}, ${row["State"]}</p></div><br />`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchChart(SOURCE_URL).then(doParse).then(update);
});

/*<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    Dropdown button
  </button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
    <a class="dropdown-item" href="#">Action</a>
    <a class="dropdown-item" href="#">Another action</a>
    <a class="dropdown-item" href="#">Something else here</a>
  </div>
</div>*/