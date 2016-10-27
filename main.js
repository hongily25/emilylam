(function() {
  'use strict';

  var listEl = document.querySelector('#list');

  var books = [
    {title: 'Emma', year: 1815, author: 'Jane Austen'},
    {title: 'Jane Eyre', year: 1847, author: 'Charlotte Brontë'},
    {title: 'Wuthering Heights', year: 1847, author: 'Emily Brontë'},
  ];

  function appendListItem (text) {
    var entry = document.createElement('li');
    entry.appendChild(document.createTextNode(text));
    listEl.appendChild(entry);
  }

  //================================
  // Your code here
  var string;
  
for (var i = 0; i < books.length; i++) {
  string = books[i].title + ' by ' + books[i].author + ' (' + books[i].year + ')';
  appendListItem(string);
}

  //================================

}());
