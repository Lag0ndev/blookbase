/* Blookbase Settings enhance — more themes, preview popup, fonts, gradient toggle */
(function(){
'use strict';
if (window.__bbSettingsEnh) return;
window.__bbSettingsEnh = 1;

var EXTRA_THEMES = [
  {key:'ocean',name:'Ocean',bgTop:'#00c6ff',bgMid:'#0072ff',bgBottom:'#003a8c',angle:160,accent:'#00e5c0',accentDark:'#009e84'},
  {key:'candy',name:'Candy',bgTop:'#ff9a9e',bgMid:'#fad0c4',bgBottom:'#fbc2eb',angle:140,accent:'#ff6b9d',accentDark:'#c93d6e},
  {key:'lava',name:'Lava',bgTop:'#f12711',bgMid:'#f5af19',bgBottom:'#7b2d00',angle:155,accent:'#ff6a00',accentDark:'#b34500},
  {key:'aurora',name:'Aurora',bgTop:'#00f5a0',bgMid:'#00d9f5',bgBottom:'#6a11cb',angle:145,accent:'#7cffcb',accentDark:'#2a9d7a},
  {key:'grape',name:'Grape',bgTop:'#834d9b',bgMid:'#d04ed6',bgBottom:'#4a148c',angle:150,accent:'#e040fb',accentDark:'#9c27b0},
  {key:'mint',name:'Mint',bgTop:'#d4fc79',bgMid:'#96e6a1',bgBottom:'#0ba360',angle:165,accent:'#2ecc71',accentDark:'#1b8a4a},
  {key:'rose',name:'Rose',bgTop:'#ffecd2',bgMid:'#fcb69f',bgBottom:'#ee9ca7',angle:150,accent:'#e91e63',accentDark:'#ad1457},
  {key:'steel',name:'Steel',bgTop:'#bdc3c7',bgMid:'#2c3e50',bgBottom:'#000000',angle:160,accent:'#3498db',accentDark:##1a5276},
  {key:'honey',name:'Honey',bgTop:'#f6d365',bgMid:'#fda085',bgBottom:'#c97b2a',angle:145,accent:'#f39c12',accentDark:'#b9770e},
  {key:'neon',name:'Neon',bgTop:'#0f0c29',bgMid:'#302b63',bgBottom:'#24243e',angle:155,accent:'#39ff14',accentDark:'#1fa008},
  {key:'sky',name:'Sky',bgTop:'#a1c4fd',bgMid:'#c2e9fb',bgBottom:'#89f7fe',angle:160,accent:'#5dade2',accentDark:##2874a6},
  {key:'ember',name:'Ember',bgTop:'#eb3349',bgMid:'#f45c43',bgBottom:'#4a0e0e',angle:150,accent:'#ff5252',accentDark:'#c62828},
  {key:'lilac',name:'Lilac',bgTop:'#e0c3fc',bgMid:'#8ec5fc',bgBottom:'#667eea',angle:140,accent:'#9b59b6',accentDark:'#6c3483},
  {key:'moss',name:'Moss',bgTop:'#56ab2f',bgMid:'#a8e063',bgBottom:'#1b5e20',angle:170,accent:'#8bc34a',accentDark:'#558b2f},
  {key:'ink',name:'Ink',bgTop:'#232526',bgMid:'#414345',bgBottom:'#000000',angle:160,accent:'#00bcd4',accentDark:'#00838f},
  {key:'peach',name:'Peach',bgTop:'#ffecd2',bgMid:'#fcb69f',bgBottom:'#ff9a9e',angle:145,accent:'#ff8a65',accentDark:'#e64a19},
  {key:'ice',name:'Ice',bgTop:'#e0eafc',bgMid:'#cfdef3',bgBottom:'#a8c0ff',angle:155,accent:'#5c6bc0',accentDark:'#3949ab},
  {key:'royal',name:'Royal',bgTop:'#141e30',bgMid:'#243b55',bgBottom:'#0f2027',angle:150,accent:'#f1c40f',accentDark:'#b7950b},
  {key:'cotton',name:'Cotton',bgTop:'#fbc2eb',bgMid:'#a6c1ee',bgBottom:'#fad0c4',angle:140,accent:'#ec407a',accentDark:'#ad1457},
  {key:'volcano',name:'Volcano',bgTop:'#ff512f',bgMid:'#dd2476',bgBottom:'#3a0ca3',angle:155,accent:'#ff6b6b',accentDark:'#c0392b},
  {key:'sage',name:'Sage',bgTop:'#d5ecc2',bgMid:'#98ddc4',bgBottom:'#6bb3a8',angle:160,accent:'#4db6ac',accentDark:'#2e7d6f},
  {key:'berry',name:'Berry',bgTop:'#8e2de2',bgMid:'#4a00e0',bgBottom:'#1a0033',angle:150,accent:'#ce93d8',accentDark:'#8e24aa}
];

var FONTS_HEADER = [
  {key:'titan', name:'Titan One', css:"'Titan One', cursive'},
  {key:'nunito', name:'Nunito', css:"vNunito', sans-serif"},
