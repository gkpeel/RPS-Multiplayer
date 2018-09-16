// GAME OBJECT
var rpsGame = {
    gamesPlayed: 0,
    player1: {
        set: false,
        wins: 0,
        currentMove: "",
    },
    player2: {
        set: false,
        wins: 0,
        currentMove: "",
    },

    rpsRound: function() {
        if (this.player1.currentMove === this.player2.currentMove) {
            winner = "Tie Game";
            //TODO: return Tie display, ask to select again - refresh game round
        } else if (this.player1.currentMove === "r" && this.player2.currentMove !== "p") {
            this.player1.wins++;
            //TODO: create winner display function to update outcome text
        } else if (this.player1.currentMove === "p" && this.player2.currentMove !== "s") {
            this.player1.wins++;
        } else if (this.player1.currentMove === "s" && this.player2.currentMove !== "r") {
            this.player1.wins++;
        } else {
            this.player2.winss++;
        }
        gamesPlayed++;
    },

    loadMove: function() {
        $("").attr('src',  )

    },

    revealMove: function() {

    }

}

// Initialize Firebase
var config = {
apiKey: "AIzaSyAy3sFOQIVj3yVVeBBOC_v1uAX79g2mDAg",
authDomain: "rps-multiplayer-17bba.firebaseapp.com",
databaseURL: "https://rps-multiplayer-17bba.firebaseio.com",
projectId: "rps-multiplayer-17bba",
storageBucket: "rps-multiplayer-17bba.appspot.com",
messagingSenderId: "217792731039"
};

firebase.initializeApp(config);

var database = firebase.database();

$(document).ready(function(){

    // rpsGame.setPlayer();

    $(".btn-move").on("click", function() {
        rpsGame.player1.currentMove = $(this).attr("data-move");
        console.log(rpsGame.player1.currentMove);
        $("#game-instructions").text($(this).text());
    });

    database.ref().on("value", function(childSnapshot) {
        var game = childSnapshot.val().rpsGame;
        // Log everything that's coming out of snapshot
        console.log(game);

    // Handle the errors
    }, function(errorObject) {

        console.log("Errors handled: " + errorObject.code);

    });

    // dataRef.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
    //     // Change the HTML to reflect
    //     $("#name-display").text(snapshot.val().name);
    //     $("#email-display").text(snapshot.val().email);
    //     $("#age-display").text(snapshot.val().age);
    //     $("#comment-display").text(snapshot.val().comment);
    // });

});

// Server based game logic

// server game states
// number of active windows (odd/even) assign to games
    // player1/player2


// on window load, look at firebase to see if the player1 variable is set, 
// if not, set fb variable to true set rpsGame object to true
// in window message say waiting for another player

// on window load, look at firebase fto see if the player1 variables is set, 
// if it is, set the fb gameReady to true
