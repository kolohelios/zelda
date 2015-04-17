'use strict';
/* global Firebase */

var root, characters, items, myKey, myCharacter;

var moveSnd = '/assets/blip.wav';
var blackholeSnd = '/assets/blackhole.wav';
var knifeSnd = '/assets/knife.wav';
var healthSnd = '/assets/health.wav';
var $sound;

$(document).ready(init);

function init(){
  root = new Firebase('https://zelda-kolohelios.firebaseio.com/');
  characters = root.child('characters');
  items = root.child('items');
  $('#create-user').click(createUser);
  $('#login-user').click(loginUser);
  $('#logout-user').click(logoutUser);
  $('#create-character').click(createCharacter);
  $('#start-user').click(startUser);
  $(document).keydown(keyDown);
  characters.on('child_added', characterAdded);
  items.on('child_added', itemAdded);
  characters.on('child_changed', characterChanged);
  items.on('child_removed', itemRemoved);
  $sound = $('#sound');
  startTimer();
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
    myCharacter = character;
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
  event.preventDefault();
  var x = $('.avatar-' + myCharacter.handle).data('x');
  var y = $('.avatar-' + myCharacter.handle).data('y');

  switch (event.keyCode){
    case 37:
      x -= 1;
      break;
    case 38:
      y -= 1;
      break;
    case 39:
      x += 1;
      break;
    case 40:
      y += 1;
  }
  x = Math.min(x, 9);
  x = Math.max(x, 0);
  y = Math.min(y, 9);
  y = Math.max(y, 0);

  characters.child(myKey).update({x: x, y: y});

  var $loc = $('#board td[data-x="' + x + '"][data-y="' + y + '"]');
  var key = $loc.data('key');

  if($loc.hasClass('health')){
    playSound(healthSnd);
    items.child(key).remove();
  } else if($loc.hasClass('blackhole')){
    playSound(blackholeSnd);
    items.child(key).remove();
  } else if($loc.hasClass('weapon')){
    playSound(knifeSnd);
    items.child(key).remove();
  } else{
    playSound(moveSnd);
  }
}

function startTimer(){
  setInterval(dropItems, 10000);
}

function dropItems(){
  var names = ['health', 'weapon', 'blackhole'];
  var rnd = Math.floor(Math.random() * names.length);
  var name = names[rnd];

  var x = Math.floor(Math.random() * 10);
  var y = Math.floor(Math.random() * 10);

  items.push({
    name: name,
    x: x,
    y: y
  });
}

function itemAdded(snapshot){
  var drop = snapshot.val();
  var key = snapshot.key();
  var item = drop.name;
  var x = drop.x;
  var y = drop.y;
  console.log('item', item, 'x', x, 'y', y);
  var $itemLoc = $('#board td[data-x="' + x + '"][data-y="' + y + '"]');
  $itemLoc.addClass(item);
  $itemLoc.attr('data-key', key);
}

function playSound(sound){
  $sound.attr('src', sound);
  $sound[0].play();
}

function itemRemoved(snapshot){
  var key = snapshot.key();
  $('#board td[data-key="' + key + '"]').removeClass('health weapon blackhole').attr('data-key', '');

}
