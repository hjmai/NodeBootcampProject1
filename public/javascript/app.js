var selectedDeck;
var cardCount = 0;
//adds cards to deck, if it is the first card, we remove the placeholder in array
function addCard(cardObject) {
    if (selectedDeck.firstCard) {
        selectedDeck.cards.shift();
        selectedDeck.cards.push(cardObject);
        selectedDeck.firstCard = false;
    }
    else {
        selectedDeck.cards.push(cardObject);
    }

}

//function for drawing cards
function drawCards(cardImage, loopedCard) {
    if (selectedDeck) {
        var mainCardDiv = $("<div>");
        var mainDisplayImg = $('<img class="responsive-img">');
        if (!selectedDeck.firstCard) {
            var removeButton = $('<button class="btn purple waves-effect">');
            removeButton.html("Remove").addClass("removeButton");
            removeButton.data("key", loopedCard);
            mainDisplayImg.attr("src", cardImage);
            mainCardDiv.append(mainDisplayImg);
            mainCardDiv.append(removeButton);
            var column = $('<div class="col s4">');
            column.html(mainCardDiv);
            $('.mainRow').prepend(column);
        }
    }
}

//when you select a deck
$('body').on('click', '.deckBtn', function () {
    $('.mainRow').empty();
    selectedDeck = $(this).data('key');
    if (!selectedDeck.firstCard) {
        for (var i = 0; i < selectedDeck.cards.length; i++) {
            var mainCardDiv = $("<div>");
            var mainDisplayImg = $('<img class="responsive-img">');
            var removeButton = $('<button class="btn purple waves-effect">');
            removeButton.html("Remove").addClass("removeButton");
            removeButton.data("key", selectedDeck.cards[i]);
            mainDisplayImg.attr("src", selectedDeck.cards[i].img);
            mainCardDiv.append(mainDisplayImg);
            mainCardDiv.append(removeButton);
            var column = $('<div class="col s4">');
            column.html(mainCardDiv);
            $('.mainRow').prepend(column);
        }
    }
    $("#currentDeckDisplay").html("Current Deck: " + selectedDeck.name);
})

$(document).ready(function () {
    $(".modal").modal();
});
// Initialize Firebase
var config = {
    apiKey: "AIzaSyABeGlxKmwxTzy_gCIbsHPd5FopDK7Sg3o",
    authDomain: "fire-rocks-7d02e.firebaseapp.com",
    databaseURL: "https://fire-rocks-7d02e.firebaseio.com",
    projectId: "fire-rocks-7d02e",
    storageBucket: "",
    messagingSenderId: "109705898493"
};
firebase.initializeApp(config);

var database = firebase.database();

var queryUrl = "https://omgvamp-hearthstone-v1.p.mashape.com/cards/search/";

//declaring card variable to use later
var cardImage;
//declaring variable to store the created deck in
var selectedDeck;

//deck object class
class UserDeck {
    constructor(name, author, deckClass) {
        this.name = name;
        this.author = author;
        this.deckClass = deckClass;
        //initialze array with placeholder value because firebase can't hold empty arrays
        this.cards = [1];
        this.complete = false;
        this.firstCard = true;
        this.deckId = (Math.ceil(Math.random() * 100000));
    }
};


//on clicking save in deck create modal, creating deck and selecting it for editing
$('.save').on('click', function () {
    var deckName = $("#createDeck").val().trim();
    var authorName = $("#addAuthor").val().trim();
    var dClass = $("#Deck-class").val();
    if (dClass != null && deckName != "" && authorName != "") {
        selectedDeck = new UserDeck(deckName, authorName, dClass);
        $("#currentDeckDisplay").html("Current Deck: " + selectedDeck.name);
        database.ref('decks/' + selectedDeck.deckId).set({
            selectedDeck
        });
        $('.mainRow').empty();
        drawCards();
    }
    else {
        alert("Need to fill in deck information");
    }
});

//function for action after pressing add button
$("body").on("click", ".addBtn", function () {
    if (selectedDeck.cards.length < 30) {
        cardCount = 0;
        for (var j = 0; j < selectedDeck.cards.length; j++) {
            if ($(this).data('key') === selectedDeck.cards[j]) {
                cardCount++
            }
        }
        if (cardCount < 2) {
            addCard($(this).data('key'));
            database.ref('decks/' + selectedDeck.deckId).set({
                selectedDeck
            });
        }
        else {
            alert("cant use cards more than twice");
        }
        $(".mainRow").empty();
        for (var k = 0; k < selectedDeck.cards.length; k++) {
            drawCards(selectedDeck.cards[k].img, selectedDeck.cards[k]);
        }
    }
    else {
        alert("Too many cards dude");
    }
})

//function after pressing remove button{
$("body").on("click", ".removeButton", function (e) {
    var rmCard = $(this).data('key');
    var deckLocation = selectedDeck.cards.indexOf(rmCard);
    if (selectedDeck.cards.length === 1) {
        selectedDeck.cards.splice(deckLocation, 1, '1');
        selectedDeck.firstCard = true
    }
    else {
        selectedDeck.cards.splice(deckLocation, 1);
    }
    database.ref('decks/' + selectedDeck.deckId).set({
        selectedDeck
    });
    $(".mainRow").empty();
    for (var q = 0; q < selectedDeck.cards.length; q++) {
        drawCards(selectedDeck.cards[q].img, selectedDeck.cards[q]);
    }
});


//API call
$('.searchBtn').on("click", function (e) {
    var userQ = $("#searchCard").val().trim();
    var fullUrl = queryUrl + userQ + "?collectible=1";
    e.preventDefault();
    $.ajax({
        url: fullUrl,
        headers:
            {
                "X-Mashape-Key": "S7jGwxLjYcmshC0yicFN1Q6Uq9Top1eA0DYjsnxQATIfAdbQnf"
            },
        method: "GET"
    }).then(function (response) {
        $("#searchRow").empty();
        function showResults() {
            for (var i = 0; i < response.length; i++) {
                if (response[i].playerClass === selectedDeck.deckClass || response[i].playerClass === 'Neutral') {
                    cardImage = response[i].img;
                    var cardDiv = $("<div>");
                    var displayImg = $('<img class="responsive-img">');
                    var addButton = $('<button class="btn purple addBtn waves-effect">');
                    addButton.html("Add").addClass("addButton");
                    addButton.data("key", response[i]);
                    addButton.attr("data-img", response[i].img);
                    displayImg.attr("src", cardImage);
                    cardDiv.append(displayImg);
                    cardDiv.append(addButton);
                    var column = $('<div class="col s4">');
                    column.html(cardDiv);
                    $('#searchRow').append(column);
                };
            };
        };
        showResults();
    })
});

//grabbing decks from database and showing them in sidebar and showing new cards as they are added
database.ref('decks/').on('value', function (snapshot) {
    $('.deckList').empty();
    $(".mainRow").empty();
    snapshot.forEach(function (childSnapshot) {
        var obj = childSnapshot.val();
        var deckClass = obj.selectedDeck.deckClass.toLowerCase();
        var button = $('<button class="btn purple deckBtn waves-effect">');
        button.data("key", obj.selectedDeck);
        button.html('<img class="classIcon" style="height: 30px; width: 30px;" src="/images/' + deckClass + '.png"> ' + obj.selectedDeck.name);
        // button.text(obj.selectedDeck.name);
        $('.deckList').append(button);
    })

})

//my search function
$('#search').keypress(function (e) {
    e.preventDefault();
    if (e.which == 13 && $('#search').val() !== '') {
        var value = $('#search').val();
        $('#search').val('');
        var column = $('<div class="col s4">');
        column.text(value);
        $('.mainRow').append(column);
    }
});

$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();
    $('.tooltipped').tooltip();
});