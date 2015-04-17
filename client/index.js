'use strict';
/* globals: Firebase true */

var root, characters;

$(document).ready(init);

function init(){
  root = new Firebase('https://zelda-kolohelios.firebaseio.com/');
  characters = root.child('characters');
  $('#create-user').click(createUser);
  $('#login-user').click(loginUser);
  $('#logout-user').click(logoutUser);
  $('#create-character').click(createCharacter);
  characters.on('child_added', characterAdded);
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
  console.log(myUid);
  if(myUid === character.uid){
    active = 'active';
  }
  var tr =  '<tr class="' + active + '"><td>' + character.handle + '</td><td><img src="' + character.avatar + '"></td></tr>';
  $('#characters > tbody').append(tr);
  console.log(character);
}

function logoutUser(){
  console.log('running');
  root.unauth();
  $('#characters > tbody > tr.active').removeClass('active');
}

function redrawCharacters(){
  $('#characters > tbody').empty();
  characters.off('child_added', characterAdded);
  characters.on('child_added', characterAdded);
}
