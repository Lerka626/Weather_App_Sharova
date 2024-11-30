// Демо-ключ 2ГИС

const location_map_key = '60b74b7d-1cc2-42bc-84e5-c57a6efc012f'

// Получаем доступ к форме

const form = document.querySelector('#form');

// Доступ к элементам первой и нулевой карточкам

const name_city = document.querySelector('#name_city');
const temp_morning_start = document.querySelector('#temp_morning_start');
const temp_morning_end = document.querySelector('#temp_morning_end');
const temp_afternoon_start = document.querySelector('#temp_afternoon_start');
const temp_afternoon_end = document.querySelector('#temp_afternoon_end');
const temp_evening_start = document.querySelector('#temp_evening_start');
const temp_evening_end = document.querySelector('#temp_evening_end');
const temp_night_start = document.querySelector('#temp_night_start');
const temp_night_end = document.querySelector('#temp_night_end');
const weather_icon_m = document.querySelector('#weather_icon_m');
const weather_icon_a = document.querySelector('#weather_icon_a');
const weather_icon_e = document.querySelector('#weather_icon_e');
const weather_icon_n = document.querySelector('#weather_icon_n');
const weather_condition_m = document.querySelector('#weather_condition_m');
const weather_condition_a = document.querySelector('#weather_condition_a');
const weather_condition_e = document.querySelector('#weather_condition_e');
const weather_condition_n = document.querySelector('#weather_condition_n');

// Доступ к кнопкам пролистывания вправо и влево

const swipe_left_buttons = document.querySelector('#swipe_left_buttons');
const swipe_right_buttons = document.querySelector('#swipe_right_buttons');

// Доступ к второй карточке

const wind_value_m = document.querySelector('#wind_value_m');
const wind_dir_m = document.querySelector('#wind_direction_m');
const wind_value_a = document.querySelector('#wind_value_a');
const wind_dir_a = document.querySelector('#wind_direction_a');
const wind_value_e = document.querySelector('#wind_value_e');
const wind_dir_e = document.querySelector('#wind_direction_e');
const wind_value_n = document.querySelector('#wind_value_n');
const wind_dir_n = document.querySelector('#wind_direction_n');

// Доступ к третьей карточке

const value_humidity_m = document.querySelector('#value_humidity_m');
const value_humidity_a = document.querySelector('#value_humidity_a');
const value_humidity_e = document.querySelector('#value_humidity_e');
const value_humidity_n = document.querySelector('#value_humidity_n');

// Доступ к четвертой карточке

const value_pressure_m = document.querySelector('#value_pressure_m');
const value_pressure_a = document.querySelector('#value_pressure_a');
const value_pressure_e = document.querySelector('#value_pressure_e');
const value_pressure_n = document.querySelector('#value_pressure_n');

// Доступ к пятой карточке

const feels_like_value_m = document.querySelector('#feels_like_value_m');
const feels_like_value_a = document.querySelector('#feels_like_value_a');
const feels_like_value_e = document.querySelector('#feels_like_value_e');
const feels_like_value_n = document.querySelector('#feels_like_value_n');

let save_data = [];
let ind_current_card = 0;

// Блокируем кнопку enter

document.querySelector('.form').addEventListener('keydown', function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
    }
});

// Получаем необходимые данные из файла json

const necessary_character = ["humidity", "pressure_mm", "temp_max", "temp_min", "feels_like", "wind_dir", "wind_speed", "condition"];
const coordinates = []
const name_cities = []

function get_data(doc_json, lat, lon) {
    const list_key = doc_json["info"]["tzinfo"]["name"].split('/')[0] + ' ' + doc_json["forecasts"]["0"]["date"];
    name_cities.push(doc_json["info"]["tzinfo"]["name"].split('/')[0]);
    coordinates.push([lat, lon]);
    const data = { list_key: [ { "season": doc_json["fact"]["season"] }, { "morning": {} }, { "afternoon": {} }, { "evening": {} }, { "night": {} }]};
    let parts = doc_json["forecasts"][0]["parts"];
    let forecasts = doc_json["forecasts"];
    temp_max_value = forecasts[0]["hours"][23]["temp"];
    temp_min_value = forecasts[1]["hours"][0]["temp"];
    necessary_character.forEach(character => {
        if (parts.morning && parts.morning.hasOwnProperty(character)) {
            data.list_key[1]["morning"][character] = parts.morning[character];
        }
        if (parts.day && parts.day.hasOwnProperty(character)) {
            data.list_key[2]["afternoon"][character] = parts.day[character];
        }
        if (parts.evening && parts.evening.hasOwnProperty(character)) {
            data.list_key[3]["evening"][character] = parts.evening[character];
        }
        if (forecasts[0]["hours"] && forecasts[1]["hours"]) {
            data.list_key[4]["night"][character] = forecasts[0]["hours"][23][character];
        }
        data.list_key[4]["night"]["temp_max"] = temp_max_value;
        data.list_key[4]["night"]["temp_min"] = temp_min_value;
    });
    return data;
}

// Отображение локации и проверка на загрузку и анализ html браузером, получение новых данных

let save_location = [];

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('show-weather').addEventListener('click', async function (event) {
        const city_lat = document.querySelector('#latitude').value.trim();
        const city_lon = document.querySelector('#longitude').value.trim();
        const { lat, lon, isValid } = validate_coordinates(city_lat, city_lon);
        if (!isValid) {
            alert('Пожалуйста, введите корректные значения широты и долготы!');
            return;
        }
        show_map(lat, lon);
        await show_weather(lat, lon);
    });
});

// Проверка координат

function validate_coordinates(city_lat, city_lon) {
    const lat = parseFloat(city_lat);
    const lon = parseFloat(city_lon);
    const isValid = city_lat && city_lon && !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    return { lat, lon, isValid };
}

// Отображение карты

const location_block = document.getElementById('location');

function show_map(lat, lon) {
    const location_block = document.getElementById('location');
    if (!location_block) {
        console.error("Элемент с id 'location' не найден!");
        return;
    }
    location_block.innerHTML = '';
    let map;
    if (save_location.length > 0) {
        map = save_location[save_location.length - 1];
        map.setCenter([lat, lon]);
        map.setZoom(13);
        loadMapAPI().then(() => {
            map = new mapgl.Map('location', {
                center: [lat, lon],
                zoom: 13,
                key: location_map_key
            });
            map.setOption('loopWorld', true);
            save_location.push(map);
        }).catch((error) => {
            console.error('Ошибка загрузки карты:', error);
        });
    } else {
        loadMapAPI().then(() => {
            map = new mapgl.Map('location', {
                center: [lat, lon],
                zoom: 13,
                key: location_map_key
            });
            map.setOption('loopWorld', true);
            save_location.push(map);
        }).catch((error) => {
            console.error('Ошибка загрузки карты:', error);
        });
    }
}

function loadMapAPI() {
    return new Promise((resolve, reject) => {
        if (typeof mapgl !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        const cacheBuster = forceReload ? `&cacheBust=${new Date().getTime()}` : '';
        script.src = 'https://mapgl.2gis.com/api/js/v1?callback=initMap';
        script.async = true;
        script.defer = true;
        window.initMap = function () {
            resolve();
        };
        script.onerror = function () {
            reject(new Error('Не удалось загрузить библиотеку MapGL.'));
        };
        document.head.appendChild(script);
    });
}

// Запрос погоды

async function show_weather(lat, lon) {
    const url = `http://localhost:8080?lat=${lat}&lon=${lon}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        const data = await response.json();
        console.log("Weather data:", data);
        save_data.push(get_data(data, lat, lon));
        update_weather_info_card_1(save_data.length - 1);
    } catch (error) {
        console.error("Ошибка при получении данных о погоде:", error);
    }
}

// Блокируем на свякий случай enter в поле широты и долготы

const latitude_input = document.querySelector('#latitude');
const longitude_input = document.querySelector('#longitude');

latitude_input.addEventListener('keydown', function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
    }
});

longitude_input.addEventListener('keydown', function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
    }
});

// Пролистывание влево и вправо

swipe_left_buttons.addEventListener('click', function (e) {
    e.preventDefault();
    if (ind_current_card > 0) {
        ind_current_card--;
        update_weather_info_card_1(ind_current_card);
        location_block.innerHTML = '';
        const map = save_location[ind_current_card];
        location_block.appendChild(map.container);
        map.setCenter([parseFloat(coordinates[ind_current_card][0]), parseFloat(coordinates[ind_current_card][1])]);
    }
});

swipe_right_buttons.addEventListener('click', function (e) {
    e.preventDefault();
    if (ind_current_card < save_data.length - 1) {
        ind_current_card++;
        update_weather_info_card_1(ind_current_card);
        location_block.innerHTML = '';
        const map = save_location[ind_current_card];
        location_block.appendChild(map.container);
        map.setCenter([parseFloat(coordinates[ind_current_card][0]), parseFloat(coordinates[ind_current_card])]);
    }
});

// Проверка "Не привышает ли количество локаций допустимое?". Если превышает, то стираем предыдущие 3

function check_count_location() {
    if (save_data.length > 3) {
        save_data = [save_data[save_data.length - 1]];
        save_location = [save_location[save_location.length - 1]];
        name_cities = [name_cities[name_cities.length - 1]];
        ind_current_card = 0;
    }
}

const condition_result = {
    "clear": "Ясно",
    "partly-cloudy": "Переменная облачность",
    "cloudy": "Облачно",
    "overcast": "Пасмурно",
    "light-rain": "Моросящий дождь",
    "heavy-rain": "Дождь",
    "showers": "Ливневые дожди",
    "wet-snow": "Снег с дождем",
    "light-snow": "Небольшой снег",
    "snow": "Снег",
    "snowfall": "Снегопад",
    "hail": "Град",
    "thunderstorm": "Гроза",
    "thunderstorm-with-rain": "Дождь с грозой",
    "thunderstorm-with-hail": "Град с грозой"
};

const season_day = {
    "winner": ["-night", "-day", "-night", "-night"],
    "spring": ["-day", "-day", "-night", "-night"],
    "summer": ["-day", "-day", "-day", "-night"],
    "autumn": ["-day", "-day", "-night", "-night"]
};

const all_day_part = ["morning", "afternoon", "evening", "night"];

const name_temp = { 
    morning: [temp_morning_start, temp_morning_end, weather_icon_m, weather_condition_m], 
    afternoon: [temp_afternoon_start, temp_afternoon_end, weather_icon_a, weather_condition_a],
    evening: [temp_evening_start, temp_evening_end, weather_icon_e, weather_condition_e],
    night: [temp_night_start, temp_night_end, weather_icon_n, weather_condition_n]
};

// Обновляем карточку 1 

function update_weather_info_card_1(card_index) {
    check_count_location();
    clear_card_1();
    document.getElementById('name_city').textContent = '';
    const current_data = save_data[card_index];
    keys_list = Object.keys(current_data);
    document.getElementById('name_city').textContent = name_cities[card_index];
    all_day_part.forEach((dayPart) => {
        const day_part = current_data[keys_list[0]][all_day_part.indexOf(dayPart) + 1];
        keys_dayPart = Object.keys(day_part);
        let name_season = save_data[card_index][Object.keys(save_data[card_index])[0]][Object.keys("0")[0]]["season"];
        name_temp[dayPart][0].textContent = `${day_part[keys_dayPart[0]]["temp_max"]}°C`;
        name_temp[dayPart][1].textContent = `${day_part[keys_dayPart[0]]['temp_min']}°C`;
        name_temp[dayPart][2].src = get_weather_icon(day_part[keys_dayPart[0]]['condition'], dayPart, name_season);
        name_temp[dayPart][3].textContent = condition_result[day_part[keys_dayPart[0]]['condition']] || "No data";
    });
    update_weather_info_card_2(card_index);
}

function get_weather_icon(condition, dayPart, current_season) {
    let ind_dayPart = all_day_part.indexOf(dayPart);
    if (condition === "clear" || condition === "partly-cloudy"){
        return `./img/${condition + season_day[current_season][ind_dayPart]}.png`;
    } else {
        return `./img/${condition}.png`;
    }
}

// Обновляем карточку 2

const wind_directions = {sw: "ЮЗ", w: "З", se: "ЮВ", e: "В", ne: "СВ", n: "С", nw: "СВ", s: "Ю"};
const values_and_dir_wind = {
    morning: [wind_dir_m, wind_value_m], 
    afternoon: [wind_dir_a, wind_value_a], 
    evening: [wind_dir_e, wind_value_e], 
    night: [wind_dir_n, wind_value_n]};

function update_weather_info_card_2(card_index) {
    clear_card_2();
    const current_data = save_data[card_index];
    all_day_part.forEach((dayPart) => {
        let day_part = current_data[Object.keys(current_data)[0]][all_day_part.indexOf(dayPart) + 1];
        keys_dayPart = Object.keys(day_part);
        values_and_dir_wind[dayPart][0].textContent = `(${wind_directions[day_part[keys_dayPart[0]]["wind_dir"]]})`;
        values_and_dir_wind[dayPart][1].textContent = `${day_part[keys_dayPart[0]]["wind_speed"]}`;
    });
    update_weather_info_card_3(card_index);
}

// Обновляем карточку 3

const values_humidity = {
    "morning": value_humidity_m,
    "afternoon": value_humidity_a,
    "evening": value_humidity_e,
    "night": value_humidity_n
};

function update_weather_info_card_3(card_index) {
    clear_card_3();
    const current_data = save_data[card_index];
    all_day_part.forEach((dayPart) => {
        let day_data = current_data[Object.keys(current_data)[0]][all_day_part.indexOf(dayPart) + 1];
        values_humidity[dayPart].textContent = `${day_data[Object.keys(day_data)[0]]["humidity"]}`;
    });
    update_weather_info_card_4(card_index);
}

// Обновляем карточку 4

const values_pressure = {
    "morning": value_pressure_m,
    "afternoon": value_pressure_a,
    "evening": value_pressure_e,
    "night": value_pressure_n
};

function update_weather_info_card_4(card_index) {
    clear_card_4();
    const current_data = save_data[card_index];
    all_day_part.forEach((dayPart) => {
        let day_data = current_data[Object.keys(current_data)[0]][all_day_part.indexOf(dayPart) + 1];
        values_pressure[dayPart].textContent = `${day_data[Object.keys(day_data)[0]]["pressure_mm"]}`;
    });
    update_weather_info_card_5(card_index);
}

// Обновляем карточку 5

const values_feels_like = {
    "morning": feels_like_value_m,
    "afternoon": feels_like_value_a,
    "evening": feels_like_value_e,
    "night": feels_like_value_n
};

function update_weather_info_card_5(card_index) {
    clear_card_5();
    const current_data = save_data[card_index];
    all_day_part.forEach((dayPart) => {
        let day_data = current_data[Object.keys(current_data)[0]][all_day_part.indexOf(dayPart) + 1];
        values_feels_like[dayPart].textContent = `${day_data[Object.keys(day_data)[0]]["feels_like"]}`;
    });
}

// Выделенные методы очистки карточек 1-5

function clear_card_1() {
    const weather_table_rows = document.querySelectorAll('.weather-table__body__row');
    weather_table_rows.forEach(row => {
        row.querySelectorAll('.temp_value').forEach(temp => temp.textContent = '...');
        row.querySelector('.characteristic').textContent = '';
        row.querySelector('.icon').setAttribute('src', './img/empty.png');
    });
}

function clear_card_2() {
    const wind_table_rows = document.querySelectorAll('.wind-body-table__row');
    wind_table_rows.forEach(row => {
        row.querySelectorAll('.wind-value').forEach(windValue => windValue.textContent = '...');
        row.querySelectorAll('.wind-direction').forEach(windDir => windDir.textContent = '...');
    });
}

function clear_card_3() {
    const humidity_table_rows = document.querySelectorAll('.air-humidity-body-table__row');
    humidity_table_rows.forEach(row => {
        row.querySelectorAll('.air-humidity-value').forEach(humidityValue => humidityValue.textContent = '...');
    });
}

function clear_card_4() {
    const pressure_table_rows = document.querySelectorAll('.pressure-body-table__row');
    pressure_table_rows.forEach(row => {
        row.querySelectorAll('.pressure-value').forEach(pressureValue => pressureValue.textContent = '...');
    });
}

function clear_card_5() {
    const feels_like_table_rows = document.querySelectorAll('.feels-like-body-table__row');
    feels_like_table_rows.forEach(row => {
        row.querySelectorAll('.feels-like-value').forEach(feelsLikeValue => feelsLikeValue.textContent = '...');
    });
}

// Очистка всех данных

function reset_data() {
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('name_city').textContent = '_________'; 
    document.getElementById('location').textContent = 'Карта локации';
    clear_card_1();
    clear_card_2();
    clear_card_3();
    clear_card_4();
    clear_card_5();
    save_data = [];
    save_location = [];
    count_doc_js = 0;
    ind_current_card = 0;
    console.log("Data after reset:", save_data);
}

// Проверка нажатия кнопки сброса, если нажали, то очищаем карточки

document.getElementById('delete_data').addEventListener('click', function (event) {
    event.preventDefault();
    reset_data();
});


