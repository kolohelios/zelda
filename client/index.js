'use strict';
/* global Firebase */

var root, characters, myKey, myCharacter;

$(document).ready(init);

function init(){
  root = new Firebase('https://zelda-kolohelios.firebaseio.com/');
  characters = root.child('characters');
  $('#create-user').click(createUser);
  $('#login-user').click(loginUser);
  $('#logout-user').click(logoutUser);
  $('#create-character').click(createCharacter);
  $('#start-user').click(startUser);
  $(document).keydown(keyDown);
  characters.on('child_added', characterAdded);
  characters.on('child_changed', characterChanged);
}

function createUser(){
  var email = $('#email').val();
  var password = $('#password').val();
  root.createUser({
    email    : email,
    password : password
  }, function(error, userData) {
    if (error) {
      console.log("Error creating user:", error);
    } else {
      console.log('Error creating user:', error);
    }
  });
}

function loginUser(){
  var email = $('#email').val();
  var password = $('#password').val();

  root.authWithPassword({
    email    : email,
    password : password
  }, function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      redrawCharacters();
    }
  });
}

function createCharacter(){
  var handle = $('#handle').val();
  var avatar= $('#avatar').val();
  var uid = root.getAuth().uid;
  characters.push({
    handle: handle,
    avatar: avatar,
    uid: uid
  });

}

function characterAdded(snapshot){
  var character = snapshot.val();
  var myUid = root.getAuth() ? root.getAuth().uid : '';
  var active = '';
  if(myUid === character.uid){
    myKey = snapshot.key();
    myCharacter = snapshot.val();
    active = 'active';
  }
  var tr =  '<tr class="' + active + '"><td>' + character.handle + '</td><td><img src="' + character.avatar + '"></td></tr>';
  $('#characters > tbody').append(tr);
}

function logoutUser(){
  console.log('running');
  root.unauth();
  myKey = null;
  $('#characters > tbody > tr.active').removeClass('active');
}

function redrawCharacters(){
  $('#characters > tbody').empty();
  characters.off('child_added', characterAdded);
  characters.on('child_added', characterAdded);
}

function startUser(){
  var spaceHasNotBeenCleared = true, x, y;
  while(spaceHasNotBeenCleared){
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    var $charLoc = $('#board td[data-x="' + x + '"][data-y="' + y + '"]');
    if(!($charLoc.hasClass('avatar'))){
      spaceHasNotBeenCleared = false;
    }
  }
  characters.child(myKey).update({
    x: x,
    y: y
  });
}

function characterChanged(snapshot){
  var character = snapshot.val();
  if($('.avatar-' + character.handle).length > 0){
    $('.avatar-' + character.handle).css('background-image', '');
    $('.avatar-' + character.handle).removeClass('avatar ' + 'avatar-' + character.handle);
  }
  var $charLoc = $('#board td[data-x="' + character.x + '"][data-y="' + character.y + '"]');

  $charLoc.css('background-image', 'url("' + character.avatar + '")').addClass('avatar ' + 'avatar-' + character.handle);
}

function keyDown(event){
  var keyCode = event.keyCode;

  $('.avatar-zool').data('x');

}
