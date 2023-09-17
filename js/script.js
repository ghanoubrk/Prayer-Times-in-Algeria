
const inputSearch = document.getElementById("city-search");
const suggestionsList = document.getElementById("suggestions-list");
const activeDiv = document.querySelector(".active");

const cityNameEl = document.querySelector(".city");

var latinCityName;

const solarDate = document.querySelector(".solar-date");
const hijryDate = document.querySelector(".hijry-date");

var algeriaCities = [];


async function getCitites(){
    const response = await fetch("/assests/Wilayas_Of_Algeria.json");
    algeriaCities = await response.json();
}

function dislaySuggestedCitites(result){
    let content = result.map((city)=>{
        return `<li class="cityEl">${city.ar_name}</li> `;
    })
    if(inputSearch.value.length){
        suggestionsList.innerHTML = content.join('');
        activeDiv.classList.add("active");
    }
}


function selectCity(city){
    inputSearch.value = city.innerText;
    suggestionsList.innerHTML = "";
    activeDiv.classList.remove("active");
}


function changeCity(){
    let searchedCity = inputSearch.value;
    cityNameEl.textContent = searchedCity;
    latinCityName = algeriaCities.find(c => c.ar_name == searchedCity).name;
}


async function getData(year,month,day,latinCityName){

    let apiURL = `https://api.aladhan.com/v1/calendarByCity/${year}/${month+1}?city=${latinCityName}&country=Algeria&method=9`;
    const response  = await fetch(apiURL);
    const data = await response.json();
    return data.data[day - 1];
}

async function changeDateInfos(){
    const arMonths = ['جانفي','فيفري','مارس','أفريل','ماي','جوان','جويلية','اوت','سبتمبر','أكتوبر','نوفمبر','ديسمير']
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    const data = await getData(year,month,day,latinCityName);

    const arDay = data.date.hijri.weekday.ar;
    const hijryMonth = data.date.hijri.month.ar;
    const hijryDay = data.date.hijri.day;
    const hijriYear = data.date.hijri.year;

    solarDate.textContent = `${arDay} ${day} ${arMonths[month]} ${year} م`;
    hijryDate.textContent = `${arDay} ${hijryDay} ${hijryMonth} ${hijriYear} هـ`;

}

async function getPrayerTimes(){
    const date = new Date();
    const data = await getData(date.getFullYear(),date.getMonth(),date.getDate(),latinCityName);
    document.querySelector(".elfajr").textContent = data.timings.Fajr.replace('(CET)','') ;
    document.querySelector(".echourouk").textContent =data.timings.Sunrise.replace('(CET)','')  ;
    document.querySelector(".edhohr").textContent = data.timings.Dhuhr.replace('(CET)','') ;
    document.querySelector(".elasr").textContent = data.timings.Asr.replace('(CET)','') ;
    document.querySelector(".elmaghreb").textContent = data.timings.Maghrib.replace('(CET)','') ;
    document.querySelector(".elishaa").textContent = data.timings.Isha.replace('(CET)','') ;
}

async function getCityByIp(){
    try {
        const locationResponse = await fetch(`https://ipinfo.io/json?token=4fcd12dbaa68dc`);
        const locationData = await locationResponse.json();
        cityNameEl.textContent = algeriaCities.find(city =>city.name == locationData.region).ar_name
        latinCityName =  algeriaCities.find(city =>city.name == locationData.region).name;
    } catch (error) {
        console.log("Error "+error);
    }
}


//-----------------------------------------

window.addEventListener("onload",getCityByIp(),changeDateInfos(),getPrayerTimes());
getCitites();

inputSearch.onkeyup = function(){
   
    let result = [];
    let input = inputSearch.value;
    if(input.length){
        result = algeriaCities.filter((city)=>{
            return city.ar_name.includes(input);
        })
    }
    else if(input.length == 0){
        activeDiv.classList.remove("active");
    }
   dislaySuggestedCitites(result);
}


suggestionsList.addEventListener("click",(e)=>{
    if(e.target.matches("li")){
        selectCity(e.target);
        changeDateInfos();
        getPrayerTimes();
        changeCity();
    }
})

