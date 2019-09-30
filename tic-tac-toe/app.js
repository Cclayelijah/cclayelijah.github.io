var sign, winner, xWins = 0, oWins = 0;
var one, two, three, four, five, six, seven, eight, nine;   //values of boxes
var winningCombos = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [2,4,6],
  [0,4,8],
];

restart();

function declareWinner() {
  console.log(winner + " Wins!");
  document.getElementById("winner").innerHTML=winner + " Won!";
  if (winner == "X"){
    xWins++;
  } else {
    oWins++;
  }
  document.getElementById("xScore").innerHTML="X: " + xWins;
  document.getElementById("oScore").innerHTML="O: " + oWins;
}

function checkWin() {
  var moves = [];
  moves.push(one);
  moves.push(two);
  moves.push(three);
  moves.push(four);
  moves.push(five);
  moves.push(six);
  moves.push(seven);
  moves.push(eight);
  moves.push(nine);

  var win;
  var combo = [];
  for (i = 0; !win; i++){
    combo = winningCombos[i];
    win = (moves[combo[0]] !== "" && moves[combo[1]] !== "" && moves[combo[2]] !== "" && moves[combo[0]] == moves[combo[1]] && moves[combo[1]] == moves[combo[2]]);
    if (win) {
      winner = moves[combo[0]];
    }
  }
  return win;
}

function turnComplete() {
  sign = sign == "X" ? "O" : "X";
  if (checkWin()){
    declareWinner();
  }
}

function restart() {
  winner = "";
  sign = "X";
  one = "";
  two = "";
  three = "";
  four = "";
  five = "";
  six = "";
  seven = "";
  eight = "";
  nine = "";
  document.getElementById("winner").innerHTML="";

  for (i = 1; i <= 9; i++) {
    revert(i);
  }
}

function move(elementId) { //Function is called when box is clicked.
  if (winner == ""){
    document.getElementById(elementId).style. color="black";
    switch (elementId) {
      case 1:
        if (one == "") {
          document.getElementById(elementId).innerHTML = sign;
          one = sign;
          turnComplete(); //indicates the end of a turn.
        }
        break;
      case 2:
        if (two == "") {
          document.getElementById(elementId).innerHTML = sign;
          two = sign;
          turnComplete();
        }
        break;
      case 3:
        if (three == "") {
          document.getElementById(elementId).innerHTML = sign;
          three = sign;
          turnComplete();
        }
        break;
      case 4:
        if (four == "") {
          document.getElementById(elementId).innerHTML = sign;
          four = sign;
          turnComplete();
        }
        break;
      case 5:
        if (five == "") {
          document.getElementById(elementId).innerHTML = sign;
          five = sign;
          turnComplete();
        }
        break;
      case 6:
        if (six == "") {
          document.getElementById(elementId).innerHTML = sign;
          six = sign;
          turnComplete();
        }
        break;
      case 7:
        if (seven == "") {
          document.getElementById(elementId).innerHTML = sign;
          seven = sign;
          turnComplete();
        }
        break;
      case 8:
        if (eight == "") {
          document.getElementById(elementId).innerHTML = sign;
          eight = sign;
          turnComplete();
        }
        break;
      case 9:
        if (nine == "") {
          document.getElementById(elementId).innerHTML = sign;
          nine = sign;
          turnComplete();
        }
        break;
    }
  }
}

//The col class boxes should show the 'X' or 'O' in a lighter color when mouse
//is hovering over it.
function preview(elementId) {
  if (winner == ""){
    switch (elementId) {
      case 1:
        if (one == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 2:
        if (two == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 3:
        if (three == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 4:
        if (four == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 5:
        if (five == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 6:
        if (six == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 7:
        if (seven == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 8:
        if (eight == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
      case 9:
        if (nine == "") {
          document.getElementById(elementId).innerHTML = sign;
          document.getElementById(elementId).style.color="#ccc";
        }
        break;
    }
  }
}

function revert(elementId) {
  switch (elementId) {
    case 1:
      document.getElementById(elementId).innerHTML = one;
      break;
    case 2:
      document.getElementById(elementId).innerHTML = two;
      break;
    case 3:
      document.getElementById(elementId).innerHTML = three;
      break;
    case 4:
      document.getElementById(elementId).innerHTML = four;
      break;
    case 5:
      document.getElementById(elementId).innerHTML = five;
      break;
    case 6:
      document.getElementById(elementId).innerHTML = six;
      break;
    case 7:
      document.getElementById(elementId).innerHTML = seven;
      break;
    case 8:
      document.getElementById(elementId).innerHTML = eight;
      break;
    case 9:
      document.getElementById(elementId).innerHTML = nine;
      break;
  }
}
