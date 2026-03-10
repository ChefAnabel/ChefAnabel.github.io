let packcontent = [];//variable for the packsimulator to know wich raritys are left
let cardslist = [];//variable for the packsimulator for saving the cards corresponding to their rarity as arrays for every rarity

i18next
  .use(i18nextBrowserLanguageDetector)
  .init({
    fallbackLng: "en",
    debug: false,
    resources: 
    {
      en: 
      {
        translation: 
        {
          title: "Trading Card Game Collection Tracker",
          choose_set: "Choose a Set",
          progress: "Progress",
          total_cards: "Total Collected Cards from this Set",
          save_json: "Save JSON",
          collector_number: "Collector #",
          card_name: "Card Name",
          amount: "Amount",
          set: "Set",
          negative_cards: "You can't have negative amounts of owned cards",
          failed_load: "Failed to load card lists from the website"
        }
      },
      de: {
        translation: {
          title: "Trading Card Spiel Sammlungs-Tracker",
          choose_set: "Set auswählen",
          progress: "Fortschritt",
          total_cards: "Gesammelte Karten aus diesem Set",
          save_json: "JSON speichern",
          collector_number: "Sammler #",
          card_name: "Kartenname",
          amount: "Anzahl",
          set: "Set",
          negative_cards: "Du kannst keine negative Anzahl an Karten besitzen",
          failed_load: "Kartendaten konnten nicht geladen werden"
        }
      }
    }
  }, () => 
{
    updateContent();
    updateHtmlLang();
});

function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = i18next.t(key);
  });
}

function changeLanguage(lang) {
  i18next.changeLanguage(lang, () => {
    updateContent();
    updateHtmlLang();
  });
}

function updateHtmlLang() {
  document.documentElement.lang = i18next.language;
}

/**
 * Method for loading the Cards into the table, when a set is selected in the setselection.
 * the card data comes from fetched json, wich is selected by setselection value
 */
function loadmtgcards() {
    try
    {
        if(document.getElementById('setsselection').value !=="") {
            fetch(document.getElementById('setsselection').value)
                .then(response => response.json())
                .then(daten => {
                    const kartentabelle = document.getElementById('mtgcardlist').querySelector('tbody');
                    kartentabelle.innerHTML = "";
                    daten.forEach(card => {
                        const tabellezeile = document.createElement('tr');
                        tabellezeile.id = `karte${card.nummer}`;
                        tabellezeile.innerHTML = `
            <td id="mtgtablecell">${card.nummer}</td>
            <td id="mtgtablecell">${card.name}</td>
            <td id="mtgtablecell">${card.anzahl}</td>
            <td id="mtgtablecell">${card.setcode}</td>
            <td id="mtgtablecell"><button onclick="addcard(parentElement)">+</button></td>
            <td id="mtgtablecell"><button onclick="removecard(parentElement)">-</button></td>
            <td id="mtgtablecell">
                <div class="tooltip">&#128065
                    <span class="tooltiptext"><img src="${card.bildlink}" alt="failed to Load Image" id="imagecard"></span>
                </div>
            </td>
          `;
                        kartentabelle.appendChild(tabellezeile);
                    });
                })
                .catch(error => console.error('Could not Load json because the following Error accoured:', error));
        }
    }
    catch
    {
        window.alert("failed to load cardlists from the webside")
    }

}

/**
 * Method for increasing the number of amount in the table for the card,
 * where the button with + was clicked. uses the parentelement for it and navigates to the element with the number
 */
function addcard(parentelementtemp)
{
    try {
        let secondparent = parentelementtemp.parentElement;
        document.getElementById(secondparent.id).children[2].innerHTML = String(parseInt(document.getElementById(secondparent.id).children[2].innerHTML) + 1);
        getcollectionprogress();
    }
    catch
    {
        window.alert("failed to add card to the count of your cards")
    }
}

/**
 * Method for decreasing the number of amount in the table for the card,
 * where the button with - was clicked. uses the parentelement for it and navigates to the element with the number.
 * does not decrease amount when amount is already 0 and sends an info instead.
 */
function removecard(parentelementtemp) {
    try
    {
        let secondparent = parentelementtemp.parentElement;
        if (parseInt(document.getElementById(secondparent.id).children[2].innerHTML)>0)
        {
            document.getElementById(secondparent.id).children[2].innerHTML = String(parseInt(document.getElementById(secondparent.id).children[2].innerHTML) - 1);
            getcollectionprogress();
        }
        else
        {
            window.alert(i18next.t("negative_cards"));
        }
    }
    catch
    {
        window.alert("failed to remove card from the count of your cards")
    }
}

/**
 * method for getting elements(data of cards) and return a table to work with
 */
function getdata()
{
    try
    {
        const rowcoll = document.querySelectorAll("#mtgcardlist tbody tr");//gets every row and gets every children of the rows and puts them into a array as object
        const jsonStr = [];
        rowcoll.forEach(row =>{
            const tabledatainhalt = row.querySelectorAll("td");
            jsonStr.push({
                nummer:tabledatainhalt[0].textContent,
                name:tabledatainhalt[1].textContent,
                anzahl:parseInt(tabledatainhalt[2].textContent),
                setcode:tabledatainhalt[3].textContent,
                bildlink: tabledatainhalt[6].children[0].children[0].children[0].getAttribute("src")
            });
        });
        return jsonStr;
    }
    catch
    {
        window.alert("failed to to get data from your collection while reading data")
    }
}

/**
 * Gets collection progress by getting all rows and gets their amountvalues to track progress
 */
function getcollectionprogress()
{
    try
    {
        let cardsmax = 0;
        let yourcollectedcards = 0;
        let yourtotalcollectedcards = 0;
        const datagettemp = document.querySelectorAll('#mtgcardlist tbody tr');
        datagettemp.forEach(row =>{
            cardsmax = cardsmax+1;
            const tablecellcontent = row.querySelectorAll('td');
            if(parseInt(tablecellcontent[2].textContent)>0)
            {
                yourcollectedcards = yourcollectedcards+1;
            }
            yourtotalcollectedcards = yourtotalcollectedcards+parseInt(tablecellcontent[2].textContent);
        })
        let percentatefromcollection = yourcollectedcards/cardsmax*100
        document.getElementById('ProgressCollection').innerText =i18next.t("progress") + ": " + percentatefromcollection.toFixed(2) + "%";
        document.getElementById('totalcardsinthisset').innerText =i18next.t("total_cards") + ": " + yourtotalcollectedcards;
    }
    catch
    {
        window.alert("failed to to get calculate the progress of your collection according to the table with your inputs")
    }
}

/**
 * saves the cardcontent from the tables as jsonfile.
 */
function saveasfile()
{
    try
    {
        const cards = getdata();//calls method getdata from line 91 to get all cards as objects
        const jsonString = JSON.stringify(cards, null, 2)//converts the object array into json string
        const blob = new Blob([jsonString], {type:'application/json'});//creates a usable element(blob) with the string from aplication and uses it for next steps until download
        const url = URL.createObjectURL(blob);
        const output = document.createElement("a");
        output.href = url;
        output.download = document.getElementById('setsselection').value.substring(10,document.getElementById('setsselection').value.length-5) +"fromCardGamesCollectedCards.json";
        document.body.appendChild(output);
        output.click();
        document.body.removeChild(output);
        URL.revokeObjectURL(url);
    }
    catch
    {
        window.alert("failed to save the collection data as a file for later use")
    }
}

/**
 * Method for loading collected cards from uploaded json file and adding missing cards from json from the same set
 */
async function getasfile()
{
    try
    {//checks if correct file is selected. acomplishes that by checking the filename of the selected file and if it contains the setselectionvalue(only the name of json without .json)
        if(document.getElementById('getbutton').value.includes(document.getElementById('setsselection').value.substring(11,document.getElementById('setsselection').value.length-5)+"fromCardGamesCollectedCards") && document.getElementById('setsselection').value!=='') {
            const elementtemp = document.getElementById("getbutton");
            let fileglobal = elementtemp.files[0];
            let numinfile =[];
            let reader = new FileReader();
            const kartentabelle = document.getElementById('mtgcardlist').querySelector('tbody');
            reader.onload = function (eventt) {
                try {
                    const data = JSON.parse(eventt.target.result);
                    kartentabelle.innerHTML = "";
                    data.forEach(card => {
                    let id = card.nummer;
                    let an = card.anzahl;
                    numinfile.push({
                        nummer:id,
                        anzahl:an
                    });
                    });
                }
                catch
                {
                    alert("something went wrong")
                }
            }
            reader.readAsText(fileglobal);
            fetch(document.getElementById('setsselection').value)
                .then(response => response.json())
                .then(daten => {
                    const kartentabelle = document.getElementById('mtgcardlist').querySelector('tbody');
                    kartentabelle.innerHTML = "";
                    daten.forEach(card => {
                        let idtwo = card.nummer;
                        let isinlist = false;
                        let cardid;
                        let cardan;
                        numinfile.forEach(idandan=>{
                            if(idandan.nummer==idtwo)
                            {
                                isinlist = true;
                                cardid=idandan.nummer;
                                cardan=idandan.anzahl;
                            }
                        })
                        const tabellezeile = document.createElement('tr');
                        if(isinlist==true)
                        {
                            tabellezeile.id = `karte${cardid}`;
                            tabellezeile.innerHTML = `
                                <td id="mtgtablecell">${cardid}</td>
                                <td id="mtgtablecell">${card.name}</td>
                                <td id="mtgtablecell">${cardan}</td>
                                <td id="mtgtablecell">${card.setcode}</td>
                                <td id="mtgtablecell"><button onclick="addcard(parentElement)">+</button></td>
                                <td id="mtgtablecell"><button onclick="removecard(parentElement)">-</button></td>
                                <td id="mtgtablecell">
                                <div class="tooltip">&#128065
                                <span class="tooltiptext"><img src="${card.bildlink}" alt="failed to Load Image" id="imagecard"></span>
                                </div>
                                </td>
                            `;
                        }
                        else
                        {
                            tabellezeile.id = `karte${card.nummer}`;
                            tabellezeile.innerHTML = `
                                <td id="mtgtablecell">${card.nummer}</td>
                                <td id="mtgtablecell">${card.name}</td>
                                <td id="mtgtablecell">${card.anzahl}</td>
                                <td id="mtgtablecell">${card.setcode}</td>
                                <td id="mtgtablecell"><button onclick="addcard(parentElement)">+</button></td>
                                <td id="mtgtablecell"><button onclick="removecard(parentElement)">-</button></td>
                                <td id="mtgtablecell">
                                <div class="tooltip">&#128065
                                <span class="tooltiptext"><img src="${card.bildlink}" alt="failed to Load Image" id="imagecard"></span>
                                </div>
                                </td>
                            `;
                        }
                        kartentabelle.appendChild(tabellezeile);
                    });
                })
        }
        else {
        if (document.getElementById('setsselection').value !== '') {
            window.alert("please select a json File with the filename:" + document.getElementById('setsselection').value.substring(11, document.getElementById('setsselection').value.length - 5) + "fromCardGamesCollectedCards")
        } else {
            window.alert('Please Select a Set!!!')
        }
        }
        await delay(250);
        getcollectionprogress();
    }
    catch
    {
        window.alert("failed to get the data of your uploaded File, please check if your File is correct and has the right Name")
    }
}

function openpacksimulator()
{
    window.location.href = '../packsimulator.html';
}

function backtomainmenu()
{
    window.location.href = '../index.html';
}

/**
 * method for opening the pack or loading the next card in pack according to packcontent
 */
async function openpack()
{
    if(packcontent.length==0)
    {
        packcontent=await openpackfill();
    }
    else
    {
    let setforpack = document.getElementById("packselection").value;
    let cardslist = [];
    let rarity1 = [];
    let rarity2 = [];
    let rarity3 = [];
    let rarity4 = [];
    let rarity5 = [];
    let rarity6 = [];
    let rarity7 = [];
    let rarity8 = [];
    let rarity9 = [];
    let rarity10 = [];
    const response = await fetch(setforpack);
    const daten = await response.json();
    daten.forEach(card => {//loads every card filteres by their rarity into the list with raritys to select the card with the correct rarity with packcontent and the list[id]
            if(card.game=="MTG") {
            {
                if(card.rarityname=="BasicLand")
                {
                    rarity9.push(card);
                }
                else if(card.rarityname=="Common")
                {
                    rarity1.push(card);
                }
                else if(card.rarityname=="Uncommon")
                {
                    rarity2.push(card);
                }
                else if(card.rarityname=="Rare")
                {
                    rarity3.push(card);
                }
                else if(card.rarityname=="Mythic Rare")
                {
                    rarity4.push(card);
                }
                else if(card.rarityname=="TwoColorLand")
                {
                    rarity8.push(card);
                }
            }
        }})
        cardslist = [rarity1,rarity2,rarity3,rarity4,rarity5,rarity6,rarity7,rarity8,rarity9,rarity10];
        randcard = Math.floor(Math.random()*cardslist[packcontent[0]-1].length)
        const img = document.getElementById("packimage");
        img.src = cardslist[packcontent[0]-1][randcard].bildlink;
        packcontent = packcontent.reverse();
        packcontent.pop();
        packcontent = packcontent.reverse();
    }
}

/**
 * Method for delaying async methods and for awaiting results of actions and tasks
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * sets the image of the pack to the image of the current selected set for the pack
 */
function packimagechange()
{
    const img = document.getElementById("packimage");
    let textvalue = document.getElementById("packselection").value
    img.src = "./sidedata/cardimages/assetssim/packs/"+textvalue.substring(11,((textvalue.length)-5))+".png"
}

/**
 * fills the packcontent list with the ids of the raritys for the picking in cardslist using 2 methods forfast cardgame adding and editing
 */
async function openpackfill()
{
    packimagechange();
    let chancelist = [];
    let endrewards = [];
    if(await checkSet()=="MTG2")
    {
        chancelist=setchancelist([10000,3675,700],[3,4,5]);
        endrewards.push(1,1,1,1,1,1);
        if(Math.floor(Math.random()*100000)<=33333)
        {
            chancelist=setchancelist([10000,3675,700],[2,3,4]);
            for(const result of calculateChance(1,chancelist,4))
            {
                endrewards.push(result);
            }
        }
        else
        {
            endrewards.push(2);
        }
        endrewards.push(2,2,2);
        chancelist=setchancelist([1000,833,250,224,167,55],[1,2,1,2,3,4]);
        for(const result of calculateChance(1,chancelist,3))
        {
            endrewards.push(result);
        }
        chancelist=setchancelist([1000,200,100,20,10,5],[3,4,3,4,3,4]);
        for(const result of calculateChance(1,chancelist,3))
        {
                endrewards.push(result);
        }
        chancelist=setchancelist([10000,4425,835,285,210,200,150,50,25],[1,2,3,4,1,2,3,4,7]);
        for(const result of calculateChance(1,chancelist,4))
        {
            endrewards.push(result);
        }
        chancelist=setchancelist([100,45],[8,9]);
        for(const result of calculateChance(1,chancelist,2))
        {
            endrewards.push(result);
        }
        endrewards.sort((b, a) => b - a);
    }
    return endrewards;
}

async function checkSet()
{
    let setname = document.getElementById("packselection").value.substring(11,document.getElementById("packselection").value.length)
    let gameString = "Empty";
    const response = await fetch("./sidedata/filecheck.json");
    const daten = await response.json();
    daten.forEach(setData => {
        if(setData.filename==setname)
        {
            gameString = setData.packtype;
        }
    });
    return gameString;
}


function setchancelist(rewardchancearray,idofreward)
{
    let chanceamount = rewardchancearray.length;
    let arrayofchances=[];
    for(let i=0;i<chanceamount;i++)
    {
        arrayofchances.push({
            rewardchance:rewardchancearray[i],
            rewardid:idofreward[i]
            })
    }
    return arrayofchances;
    
}

function calculateChance(count, chances, scalein10) {
    let results = [];
    const max = 10 ** scalein10;
    chances.sort((a, b) => a.rewardchance - b.rewardchance);
    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * max);
        for (const chanceitem of chances) {
            if (roll < chanceitem.rewardchance) {
                results.push(chanceitem.rewardid);
                break;
            }
        }
    }
    return results;
}

function startlogin() 
{
    window.location.href = './loginwindow.html';
}


/*
12 pixel abstand scene cards
35% quality on avif-export for MTG
50% quality on avif-export for ZCG
 */


