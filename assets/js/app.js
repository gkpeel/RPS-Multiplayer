// Initialize Firebase //
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


// GAME OBJECT //
var rpsGame = {

    // === RPS VARIABLES === //
    gameReady: false,
    gamesPlayed: 0,
    player: "",

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

    // === RPS METHODS === //
    // Using terminal's assigned "player" value as reference, updates wins on Firebase
    addWin: function(winner) {
        this[winner].wins++;
            database.ref(winner).update({
                wins: this[winner].wins
            });
    },

    // Resets user data for the next round, and so continuous loop with Fb doesn't occur
    clearData: function() {
        database.ref('player1').update({
            move: ""
        });
        database.ref('player2').update({
            move: ""
        });
    },

    // Uses btn-move's data-move attr, and the player val to display the correct word/image combo
    displayMove: function(val) {

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

    // Updates game's statistic's section with current values when called
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

    // From takes parameter from rpsRound() and creates personalized Game outcome message
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

    // Resets database (and in turn all game values) when called
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

    // Standard RPS game logic based on ties and one player's winning outcomes
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
    
    // Takes a firebase.database.val() parameter, see's if Fb's player1.set/player2. set val is true
    // Assigns player val locally and sets Fb's playerX.set value to true accordingly
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

    // Sends data to Fb about the player's move using their player value, updates locally with db value event listener
    updateMove: function(val) {
        database.ref(this.player).update({
            move: val
        });
    },

    // Takes data-move's attr val and creates appropriate output
    val2word: function(val) {
        if (val === "r") {
            return "Rock";
        } else if (val === "s") {
            return "Scissor";
        } else {
            return "Paper";
        }
    },

    // Welcome message to users depending on their Player #
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

    if (rpsGame.player1.set && rpsGame.player2.set) {
        $("#start").addClass('d-none');
        $("#game-instructions").html("<h3>Two people are already playing come back again later.</h3>")
    }

    // Assign to Player1 or Player2, reveal Game-move buttons
    $("#start").on('click', function(){
        if (!rpsGame.gameReady) {
            database.ref().once('value').then(function(snapshot){
                rpsGame.setPlayer(snapshot.val());
            });
            $("#start, .start-container, #rock, #paper, #scissor").toggleClass('d-none');
        } else {
            $("#start").addClass('d-none');
            $("#game-instructions").html("<h3>Two people are already playing come back again later.</h3>")
        }
    });

    //Assign move to player's proprt Fb variable, updates locally through listener
    $(".btn-move").on("click", function() {
        $("#game-instructions").text("");
        var moveVal = $(this).attr('data-move');
        if (rpsGame.gameReady) {
            rpsGame.updateMove(moveVal);
            rpsGame.displayMove(moveVal);
        }
    });

});

// blunt Fb reset on: refresh/exit
$(window).on("unload", function(){
    rpsGame.newGame();
})


// Database listener:
database.ref().on('value', function(snapshot){
    
    // Listens for any firebase value changes and updates all local variables
    rpsGame.gameReady = snapshot.val().gameReady;
    rpsGame.gamesPlayed = snapshot.val().gamesPlayed;

    rpsGame.player1.currentMove = snapshot.val().player1.move;
    rpsGame.player2.currentMove = snapshot.val().player2.move;

    rpsGame.player1.set = snapshot.val().player1.set;
    rpsGame.player2.set = snapshot.val().player2.set;

    rpsGame.player1.wins = snapshot.val().player1.wins;
    rpsGame.player2.wins = snapshot.val().player2.wins;


    // If two players are set, update player1's game-instructions
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

    // If on the latest data refresh each playerX.move has a non-blank value, check the outcome of those moves 
    if (snapshot.val().player1.move !== "" && snapshot.val().player2.move !== "") {
        rpsGame.rpsRound();
        $("#game-instructions").html("");

        // Wait 3s to clear #moves-display and prompt another round
        setTimeout(function(){
            $("#moves-display").text("");
            $("#game-instructions").html("<h3>Pick again</h3>");
        }, 3000);
    } else if (snapshot.val().player1.move !== "" || snapshot.val().player2.move !== "") {
        if (snapshot.val().player1.move !== "") {
            if (rpsGame.player === "player1") {
                $("#game-instructions").html("<h3>Waiting for Player 2</h3>");
            } else {
                $("#game-instructions").html("<h3>Player 1 selected. Waiting on you</h3>");
            }
        } else {
            if (rpsGame.player === "player2") {
                $("#game-instructions").html("<h3>Waiting for Player 1</h3>");
            } else {
                $("#game-instructions").html("<h3>Player 2 selected. Waiting on you</h3>");
            }
        }
    }
    
    // Refresh the displayed game stats on any update
    rpsGame.displayStats();

});