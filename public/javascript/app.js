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
//becuase an empty deck still has a placeholder in the card array, this shows a correct card count even if the deck is 'empty'
function showCardCount() {
    if (!selectedDeck.firstCard) {
        $("#cardCount").html("Number of cards: " + selectedDeck.cards.length + "/30")
    }
    else {
        $("#cardCount").html("Number of cards: 0/30")

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
            removeButton.addClass("z-depth-3");
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
    $("#upvotedCount").html("Upvoted: " + selectedDeck.upvotes);
    $("#downvotedCount").html("Downvoted: " + selectedDeck.downvotes);
    $("#deckAuthor").html("Author: " + selectedDeck.author);
    showCardCount();
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
        this.upvotes = 0;
        this.downvotes = 0;
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
        $("#upvotedCount").html("Upvoted: " + selectedDeck.upvotes);
        $("#downvotedCount").html("Downvoted: " + selectedDeck.downvotes);
        $("#deckAuthor").html("Author: " + selectedDeck.author);
        database.ref('decks/' + selectedDeck.deckId).set({
            selectedDeck
        });
        $('.mainRow').empty();
        drawCards();
    }
    else {
        M.toast({
            html: 'You need to fill in deck information!', 
            classes: 'red',
            options: {
                outDuration: 3000,
            }
        })
    }
});

//function for action after pressing add button
$("body").on("click", ".addBtn", function () {
    cardCount = 0;
    if (selectedDeck.cards.length < 30) {
        for (var j = 0; j < selectedDeck.cards.length; j++) {
            var cardObj = $(this).data('key')
            var selectedCardId = cardObj.cardId
            if (selectedCardId === selectedDeck.cards[j].cardId) {
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
            M.toast({html: 'You can only use the same card twice in one deck.', 
                classes: 'red',
                options: {
                    outDuration: 3000,
                }
            })
        }
        $(".mainRow").empty();
        for (var k = 0; k < selectedDeck.cards.length; k++) {
            drawCards(selectedDeck.cards[k].img, selectedDeck.cards[k]);
        }
    }
    else {
        M.toast({
            html: 'You can only have a maximum of 30 cards per deck.', 
            classes: 'red',
            options: {
                outDuration: 3000,
            }
        })
    }
})

//function after pressing remove button
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
    $("#searchRow").empty();
    e.preventDefault();
    $.ajax({
        url: fullUrl,
        headers:
            {
                "X-Mashape-Key": "S7jGwxLjYcmshC0yicFN1Q6Uq9Top1eA0DYjsnxQATIfAdbQnf"
            },
        method: "GET"
    }).then(function (response) {
        function showResults() {
            var findCount = 0
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
                    addButton.addClass("z-depth-3");
                    var column = $('<div class="col s4">');
                    column.html(cardDiv);
                    $('#searchRow').append(column);
                    findCount++;
                };
            };
            if (findCount === 0) {
                $('#searchRow').html("No matching cards found. Only neutral cards or cards that match your class are available.");
            }
        };

        showResults();

    }).fail(function () {
        if (selectedDeck) {
            $('#searchRow').html("No results, please try searching again.")
        }
        else {
            $('#searchRow').html("You need to select a deck before searching.")
        };
    })
});

//grabbing decks from database and showing them in sidebar and showing new cards as they are added
database.ref('decks/').on('value', function (snapshot) {
    $('.deckList').empty();
    $(".mainRow").empty();
    if (selectedDeck) {
        $("#upvotedCount").html("Upvoted: " + selectedDeck.upvotes);
        $("#downvotedCount").html("Downvoted: " + selectedDeck.downvotes);
        $("#deckAuthor").html("Author: " + selectedDeck.author);
        showCardCount();
        for (var v = 0; v < selectedDeck.cards.length; v++) {
            drawCards(selectedDeck.cards[v].img, selectedDeck.cards[v]);
        }
    }
    snapshot.forEach(function (childSnapshot) {
        var obj = childSnapshot.val();
        var deckClass = obj.selectedDeck.deckClass.toLowerCase();
        var button = $('<button class="btn purple deckBtn waves-effect">');
        button.data("key", obj.selectedDeck);
        button.html('<img class="classIcon" style="height: 30px; width: 30px;" src="/images/' + deckClass.toLowerCase() + '.png"> ' + obj.selectedDeck.name);
        button.prepend("&uarr; " + (obj.selectedDeck.upvotes - obj.selectedDeck.downvotes) + " ");
        // button.text(obj.selectedDeck.name);
        $('.deckList').append(button);
    })

})


//upvoting and downvoting buttons
$("#upvote").on("click", function () {
    selectedDeck.upvotes++;
    database.ref('decks/' + selectedDeck.deckId).set({
        selectedDeck
    });
});

$("#downvote").on("click", function () {
    selectedDeck.downvotes++;
    database.ref('decks/' + selectedDeck.deckId).set({
        selectedDeck
    });
});

$(document).ready(function () {
    $('.modal').modal();
    $('select').formSelect();
    $('.tooltipped').tooltip();
});