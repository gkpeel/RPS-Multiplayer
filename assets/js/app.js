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


// GAME OBJECT
var rpsGame = {
    gameReady: false,
    gamesPlayed: 0,
    player: "",
    gameMessage: "",

    player1: {
        set: false,
        wins: 0,
        currentMove: "",
        images: {
            rock: '<img class="img-fluid" src="assets/images/SVG/rock-left.svg"/>',
            paper: '<img class="img-fluid" src="assets/images/SVG/paper-left.svg"/>',
            scissor: '<img class="img-fluid" src="assets/images/SVG/scissor-left.svg"/>',
        }
    },
    player2: {
        set: false,
        wins: 0,
        currentMove: "",
        images: {
            rock: '<img class="img-fluid" src="assets/images/SVG/rock-right.svg"/>',
            paper: '<img class="img-fluid" src="assets/images/SVG/paper-right.svg"/>',
            scissor: '<img class="img-fluid" src="assets/images/SVG/scissor-right.svg"/>',
        }
    },

    addWin: function(winner) {
        this[winner].wins++;
            database.ref(winner).update({
                wins: this[winner].wins
            });
    },

    clearData: function() {
        database.ref('player1').update({
            move: ""
        });
        database.ref('player2').update({
            move: ""
        });
    },

    displayMove: function(val) {

        //displays user's move to that user
        if (val === "r") {
            $("#moves-display").html(this[this.player].images.rock + '<h3>You chose: Rock</h3>');
        }
        if (val === "p") {
            $("#moves-display").html(this[this.player].images.paper + '<h3>You chose: Paper</h3>');
        }
        if (val === "s") {
            $("#moves-display").html(this[this.player].images.scissor + '<h3>You chose: Scissor</h3>');
        }

    },

    displayStats: function() {
        $("#games-played").text(this.gamesPlayed);
        if (this.player === "player1") {
            $("#user-wins").text(this.player1.wins);
            $("#opponent-wins").text(this.player2.wins);
        } else {
            $("#user-wins").text(this.player2.wins);
            $("#opponent-wins").text(this.player1.wins);
        }
    },

    gameUpdate: function(winner) {

        if (winner !== 'tie') {

            if (this.player === winner ) {
                $("#game-instructions").html("<h3>You win!</h3>");
            } else {
                $("#game-instructions").html("<h3>You lose!</h3>");
            }
    
            var opponent = "";
            if (this.player === "player1") {
                opponent = "player2";
            } else {
                opponent = "player1";
            }
    
            var opponentMove = this[opponent].currentMove;
    
            $("#game-instructions").append("Your opponent chose: " + this.val2word(opponentMove));

        } else {
            $("#game-instructions").html("<h3>You tie!</h3>");
            $("#game-instructions").append("You and your opponent both chose: " + this.val2word(this[this.player].currentMove));            
        }


    },

    newGame: function() {
        database.ref().set({

            gameReady: false,
            gamesPlayed: 0,

            player1: {
                move: "",
                set: false,
                wins: 0,
            },
            player2: {
                move: "",
                set: false,
                wins: 0,
            }
        });
    },

    rpsRound: function() {

        if (this.player1.currentMove === this.player2.currentMove) {
            this.gameUpdate('tie');
            this.clearData();
        } else if (this.player1.currentMove === "r" && this.player2.currentMove !== "p") {
            this.gameUpdate('player1');
            this.clearData();
            this.addWin('player1');
        } else if (this.player1.currentMove === "p" && this.player2.currentMove !== "s") {
            this.gameUpdate('player1');
            this.clearData();
            this.addWin('player1');
        } else if (this.player1.currentMove === "s" && this.player2.currentMove !== "r") {
            this.gameUpdate('player1');
            this.clearData();            
            this.addWin('player1');
        } else {
            this.gameUpdate('player2');
            this.clearData();
            this.addWin('player2');
        }

        this.gamesPlayed++
        database.ref().update({
            gamesPlayed: this.gamesPlayed
        });
        
    },
                        
    setPlayer: function(snapshot) {

        // if two players are already playing, disable buttons
        if (this.gameReady === true) {
            console.log("Two people already playing");
            $("button").addClass("disabled");
            return;
        }

        // if firebase p1 variable not set
        if (!snapshot.player1.set) {
            // assign user player1 name and set "set" to true locally
            this.player = "player1";
            this.player1.set = true;
        }

        // if firebase p1 variable set and p2 variable not set
        if (snapshot.player1.set && !snapshot.player2.set) {
            this.player = "player2";

            // let this browser know that player1 is already set
            this.player1.set = true;

            // assign user player2 name and set "set" to true locally
            this.player2.set = true;

        }

        // update #game-instructions
        this.welcome();
        
        // assign set value to true on firebase
        return database.ref(this.player).update({
            set: true
        });
    },

    updateMove: function(val) {
        database.ref(this.player).update({
            move: val
        });
    },

    val2word: function(val) {
        if (val === "r") {
            return "Rock";
        } else if (val === "s") {
            return "Scissor";
        } else {
            return "Paper";
        }
    },

    welcome: function() {
        if (this.player === "player1") {
            $("#game-instructions").html('<h3>Welcome, Player 1. Waiting for Player 2.</h3>');
        }
        if (this.player === "player2") {
            $("#game-instructions").html('<h3>Thank you for joining, Player 2.</h3>');
        }
    }

}

$(document).ready(function(){

    // Assign to Player1 or Player2, reveal Game-move buttons
    $("#start").on('click', function(){
        database.ref().once('value').then(function(snapshot){
            rpsGame.setPlayer(snapshot.val());
        });
        $("#start, .start-container, #rock, #paper, #scissor").toggleClass('d-none');
    });

    //Assign player move to local variable, update firebase
    $(".btn-move").on("click", function() {
        $("#game-instructions").text("");
        var moveVal = $(this).attr('data-move');
        if (rpsGame.gameReady) {
            rpsGame.updateMove(moveVal);
            rpsGame.displayMove(moveVal);
        }
    });

});

// blunt db reset on: refresh/exit
$(window).on("unload", function(){
    rpsGame.newGame();
})

// Database listener:
// Listens for firebase value changes and updates all local variables
database.ref().on('value', function(snapshot){

    rpsGame.gameReady = snapshot.val().gameReady;
    rpsGame.gamesPlayed = snapshot.val().gamesPlayed;

    rpsGame.player1.currentMove = snapshot.val().player1.move;
    rpsGame.player2.currentMove = snapshot.val().player2.move;

    rpsGame.player1.set = snapshot.val().player1.set;
    rpsGame.player2.set = snapshot.val().player2.set;

    rpsGame.player1.wins = snapshot.val().player1.wins;
    rpsGame.player2.wins = snapshot.val().player2.wins;

    // If two players are set, update player1 game-instructions
    // 2s later: disabled classes get removed from buttons and players are prompted to play
    // gameReady changes to true so that this doesn't display on subsequent data refreshes
    if (snapshot.val().player1.set && snapshot.val().player2.set && !snapshot.val().gameReady) {
        if (rpsGame.player === "player1") {
            $("#game-instructions").html("<h3>Player 2 selected.</h3>");
        }
        setTimeout(function(){
            $("#game-instructions").html("<h3>Make your move</h3>");
            $("#rock, #paper, #scissor").removeClass('disabled');
        }, 2000);
        database.ref().update({gameReady: true});
    }

    // if (snapshot.val().player1.move !== "" || snapshot.val().player2.move !== "") {
    //     if (snapshot.val().player1.move !== "") {
    //         if (rpsGame.player === "player1") {
    //             $("#game-instructions").html("<h3>Waiting for Player 2</h3>");
    //         } else {
    //             $("#game-instructions").html("<h3>Player 1 selected. Waiting on you</h3>");
    //         }
    //     } else {
    //         if (rpsGame.player === "player2") {
    //             $("#game-instructions").html("<h3>Waiting for Player 1</h3>");
    //         } else {
    //             $("#game-instructions").html("<h3>Player 2 selected. Waiting on you</h3>");
    //         }
    //     }
    // }

    // If each player submits a move, check the outcome of those moves
    if (snapshot.val().player1.move !== "" && snapshot.val().player2.move !== "") {
        rpsGame.rpsRound();
        setTimeout(function(){
            $("#game-instructions").html("<h3>Pick again</h3>");
            $("#moves-display").text("");
        }, 3000);
    }
    
    // Refresh the displayed game stats on any update
    rpsGame.displayStats();

});