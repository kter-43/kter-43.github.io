// --- Map & setup ---
const POWERS = [
  { id:"ENG", name:"England", color:"#9400D3", homes:["Lon","Lvp","Edi"] },
  { id:"FRA", name:"France",  color:"#4169E1", homes:["Par","Mar","Bre"] },
  { id:"GER", name:"Germany", color:"#944b07ff", homes:["Kie","Ber","Mun"] },
  { id:"ITA", name:"Italy",   color:"#228B22", homes:["Ven","Rom","Nap"] },
  { id:"AUS", name:"Austria", color:"#da3919ff", homes:["Vie","Bud","Tri"] },
  { id:"RUS", name:"Russia",  color:"#8d8e91ff", homes:["War","Mos","StP","Sev"] },
  { id:"TUR", name:"Turkey",  color:"#b9a61c", homes:["Con","Smy","Ank"] },
];
const byPower = id => POWERS.find(p=>p.id===id);

const PROVINCES = {
  "Adr": {name:"Adriatic Sea", type:"sea", x:793.5, y:1048.0, adj:["Ion","Apu","Ven","Tri","Alb"],
    path:"M 1104 1335 C 1104 1321 1105 1317 1108 1304 C 1109 1300 1111 1292 1109 1288 C 1107 1284 1101 1280 1098 1277 C 1085 1265 1083 1264 1069 1254 C 1069 1254 1040 1231 1040 1231 C 1040 1231 1022 1219 1022 1219 C 1022 1219 1006 1205 1006 1205 C 1001 1201 995 1197 990 1192 C 986 1187 981 1178 982 1172 C 983 1164 989 1163 985 1155 C 978 1159 976 1173 969 1172 C 966 1171 962 1165 962 1162 C 960 1155 966 1148 964 1145 C 962 1142 958 1143 956 1144 C 952 1144 943 1148 939 1150 C 937 1151 935 1153 934 1155 C 933 1158 936 1161 935 1164 C 935 1166 932 1169 931 1171 C 929 1175 930 1182 931 1186 C 937 1198 952 1206 960 1219 C 964 1227 964 1234 967 1242 C 970 1251 979 1261 986 1267 C 991 1271 997 1274 1004 1276 C 1007 1276 1016 1277 1018 1279 C 1022 1283 1016 1286 1022 1293 C 1029 1301 1059 1319 1070 1327 C 1073 1329 1076 1332 1079 1335 C 1080 1337 1082 1340 1084 1340 C 1087 1341 1100 1336 1104 1335 z"
  },
  "Aeg": {name:"Aegean Sea", type:"sea", x:1043.5, y:1230.0, adj:["Ion","Eas","Gre","Bul","Bul-sc","Con","Smy"]},
  "Alb": {name:"Albania", type:"land", coast:true, sc:false, x:906.5, y:1113.0, adj:["Adr","Ion","Tri","Ser","Gre"]},
  "Ank": {name:"Ankara", type:"land", coast:true, sc:true, x:1301.5, y:1110.0, adj:["Bla","Con","Smy","Arm"]},
  "Apu": {name:"Apulia", type:"land", coast:true, sc:false, x:791.5, y:1106.0, adj:["Ion","Adr","Ven","Rom","Nap"]},
  "Arm": {name:"Armenia", type:"land", coast:true, sc:false, x:1484.5, y:1090.0, adj:["Bla","Ank","Sev","Smy","Syr"]},
  "Bal": {name:"Baltic Sea", type:"sea", x:878.5, y:610.0, adj:["Bot","Den","Swe","Ber","Pru","Lvn","Kie"]},
  "Bar": {name:"Barents Sea", type:"sea", x:1162.5, y:73.0, adj:["Nwg","Nwy","StP-nc","StP"]},
  "Bel": {name:"Belgium", type:"land", coast:true, sc:true, x:561.5, y:753.0, adj:["Eng","Nth","Pic,","Bur","Ruh","Hol"]},
  "Ber": {name:"Berlin", type:"land", coast:true, sc:true, x:771.5, y:690.0, adj:["Bal","Kie","Mun","Sil","Pru"]},
  "Bla": {name:"Black Sea", type:"sea", x:1233.5, y:1000.0, adj:["Con","Ank","Arm","Sev","Rum","Bul-ec","Bul"]},
  "Boh": {name:"Bohemia", type:"land", coast:false, sc:false, x:806.5, y:814.0, adj:["Mun","Sil","Gal","Vie","Tyr"]},
  "Bot": {name:"Gulf of Bothnia", type:"sea", x:941.5, y:485.0, adj:["Bal","Swe,","Fin","StP","StP-sc","Lvn"]},
  "Bre": {name:"Brest", type:"land", coast:true, sc:true, x:404.5, y:819.0, adj:["Eng","MAO","Gas","Par","Pic"]},
  "Bud": {name:"Budapest", type:"land", coast:false, sc:true, x:950.5, y:904.0, adj:["Vie","Gal","Rum","Ser","Tri"]},
  "Bul": {name:"Bulgaria", type:"land", coast:true, sc:true, x:1048.5, y:1068.0, adj:["Bul-ec","Bla","Bul-sc","Aeg","Gre","Ser","Rum","Con"]},
  "Bul-ec": {name:"Bulgaria (East Coast)", type:"land", coast:true, sc:true, x:1127.0, y:1067.0, adj:["Bla","Rum","Con"]},
  "Bul-sc": {name:"Bulgaria (South Coast)", type:"land", coast:true, sc:true, x:1070.0, y:1140.0, adj:["Aeg","Gre","Con"]},
  "Bur": {name:"Burgundy", type:"land", coast:false, sc:false, x:559.5, y:871.0, adj:["Mar","Gas","Par","Pic","Bel","Ruh","Mun"]},
  "Cly": {name:"Clyde", type:"land", coast:true, sc:false, x:436.5, y:492.0, adj:["NAO","Mwg","Edi","Lvp"]},
  "Con": {name:"Constantinople", type:"land", coast:true, sc:true, x:1145.5, y:1137.0, adj:["Bla","Aeg","Bul","Ank","Smy"]},
  "Den": {name:"Denmark", type:"land", coast:true, sc:true, x:703.5, y:587.0, adj:["Nth","Hel","Ska","Bal","Swe","Kie"]},
  "Eas": {name:"Eastern Mediterranean", type:"sea", x:1218.5, y:1311.0, adj:["Ion","Aeg","Smy","Syr"]},
  "Edi": {name:"Edinburgh", type:"land", coast:true, sc:true, x:473.5, y:514.0, adj:["Nwg","Nth","Cly","Lvp","Yor"],
    path:"M 690 621 C 683 631 677 631 673 638 C 669 644 667 656 666 663 C 666 663 661 699 661 699 C 660 708 659 714 662 723 C 664 727 674 742 677 746 C 683 746 689 748 692 747 C 697 745 697 737 696 733 C 693 724 681 713 687 701 C 691 693 701 684 707 677 C 710 674 714 669 714 665 C 712 657 697 653 690 652 C 687 652 679 654 677 651 C 674 648 681 643 683 642 C 683 642 700 631 700 631 C 706 626 702 623 696 622 C 696 622 690 621 690 621 z"},
  "Eng": {name:"English Channel", type:"sea", x:394.5, y:751.0, adj:["MAO","Iri","Nth","Wal","Lon","Bre","Pic","Bel"]},
  "Fin": {name:"Finland", type:"land", coast:true, sc:false, x:988.5, y:380.0, adj:["Bot","Swe","Nwy","StP","StP-sc"]},
  "Gal": {name:"Galicia", type:"land", coast:false, sc:false, x:999.5, y:831.0, adj:["Boh","Sil","War","Ukr","Rum","Bud","Vie"]},
  "Gas": {name:"Gascony", type:"land", coast:true, sc:false, x:422.5, y:912.0, adj:["MAO","Spa","Spa-nc","Bre","Par","Bur","Mar"]},
  "Gre": {name:"Greece", type:"land", coast:true, sc:true, x:966.5, y:1190.0, adj:["Ion","Aeg","Alb","Ser","Bul","Bul-sc"]},
  "Hel": {name:"Helgoland Bight", type:"sea", x:651.5, y:631.0, adj:["Nth","Hol","Kie","Den"]},
  "Hol": {name:"Holland", type:"land", coast:true, sc:true, x:596.5, y:711.0, adj:["Hel","Nth","Bel","Ruh","Kie"]},
  "Ion": {name:"Ionian Sea", type:"sea", x:846.5, y:1286.0, adj:["Tys","Adr","Aeg","Eas","Tun","Nap","Apu","Alb","Gre"]},
  "Iri": {name:"Irish Sea", type:"sea", x:335.5, y:661.0, adj:["NAO","MAO","Eng","Wal","Lvp"]},
  "Kie": {name:"Kiel", type:"land", coast:true, sc:true, x:683.5, y:701.0, adj:["Hel","Bal","Den","Hol","Ruh","Mun","Ber"]},
  "Lon": {name:"London", type:"land", coast:true, sc:true, x:488.5, y:675.0, adj:["Eng","Nth","Wal","Yor"]},
  "Lvn": {name:"Livonia", type:"land", coast:true, sc:false, x:1025.5, y:567.0, adj:["Bal","Bot","Pru","War","Mos","StP","StP-sc"]},
  "Lvp": {name:"Liverpool", type:"land", coast:true, sc:true, x:450.5, y:576.0, adj:["Iri","NAO","Cly","Edi","Yor","Wal"]},
  "Lyo": {name:"Gulf of Lyon", type:"sea", x:514.3, y:1055.0, adj:["Wes","Tys","Spa","Spa-sc","Mar","Pie","Tus"]},
  "MAO": {name:"Mid-Atlantic", type:"sea", x:141.8, y:835.3, adj:["NAO","Iri","Eng","Wes","NAf","Por","Spa","Spa-nc","Spa-sc","Gas","Bre"]},
  "Mar": {name:"Marseilles", type:"land", coast:true, sc:true, x:524.5, y:975.0, adj:["Lyo","Spa","Spa-sc","Gas","Bur","Pie"]},
  "Mos": {name:"Moscow", type:"land", coast:false, sc:true, x:1200.5, y:590.0, adj:["StP","Lvn","War","Ukr","Sev"]},
  "Mun": {name:"Munich", type:"land", coast:false, sc:true, x:693.5, y:828.0, adj:["Bur","Ruh","Kie","Ber","Sil","Boh","Tyr"]},
  "NAf": {name:"North Africa", type:"land", coast:true, sc:false, x:325.5, y:1281.0, adj:["MAO","Wes","Tun"]},
  "NAO": {name:"North Atlantic", type:"sea", x:180.1, y:288.2, adj:["Nwg","Iri","MAO","Cly","Lvp"]},
  "Nap": {name:"Naples", type:"land", coast:true, sc:true, x:806.5, y:1170.0, adj:["Tys","Ion","Rom","Apu"]},
  "Nth": {name:"North Sea", type:"sea", x:553.5, y:560.0, adj:["Eng","Nwg","Hel","Ska","Edi","Yor","Lon","Nwy","Den","Hol","Bel"]},
  "Nwg": {name:"Norwegian Sea", type:"sea", x:652.7, y:181.8, adj:["NAO","Bar","Nth","Cly","Edi","Nwy"]},
  "Nwy": {name:"Norway", type:"land", coast:true, sc:true, x:703.5, y:410.0, adj:["Nth","Nwg","Bar","Swe","Fin","StP","StP-nc"]},
  "Par": {name:"Paris", type:"land", coast:false, sc:true, x:488.5, y:845.0, adj:["Bre","Pic","Bur","Gas"]},
  "Pic": {name:"Picardy", type:"land", coast:true, sc:false, x:523.5, y:781.0, adj:["Eng","Bre","Par","Bur","Bel"]},
  "Pie": {name:"Piedmont", type:"land", coast:true, sc:false, x:630.5, y:968.0, adj:["Lyo","Mar","Tyr","Ven","Tus"]},
  "Por": {name:"Portugal", type:"land", coast:true, sc:true, x:181.5, y:1013.0, adj:["MAO","Spa","Spa-nc","Spa-sc"]},
  "Pru": {name:"Prussia", type:"land", coast:true, sc:false, x:865.5, y:690.0, adj:["Bal","Ber","Sil","War","Lvn"]},
  "Rom": {name:"Rome", type:"land", coast:true, sc:true, x:731.5, y:1102.0, adj:["Tys","Tus","Ven","Apu","Nap"]},
  "Ruh": {name:"Ruhr", type:"land", coast:false, sc:false, x:636.5, y:779.0, adj:["Bel","Hol","Kie","Mun","Bur"]},
  "Rum": {name:"Rumania", type:"land", coast:true, sc:true, x:1096.5, y:967.0, adj:["Bla","Bul","Bul-ec","Ser","Bud","Gal","Ukr","Sev"]},
  "Ser": {name:"Serbia", type:"land", coast:false, sc:true, x:933.5, y:1050.0, adj:["Alb","Tri","Bud","Rum","Bul","Gre"]},
  "Sev": {name:"Sevastopol", type:"land", coast:true, sc:true, x:1284.5, y:845.0, adj:["Bla","Rum","Ukr","Mos","Arm"]},
  "Sil": {name:"Silesia", type:"land", coast:false, sc:false, x:832.5, y:769.0, adj:["Ber","Pru","War","Gal","Boh","Mun"]},
  "Ska": {name:"Skagerrak", type:"sea", x:735.5, y:518.0, adj:["Nth","Bal","Nwy","Swe","Den"]},
  "Smy": {name:"Smyrna", type:"land", coast:true, sc:true, x:1253.5, y:1210.0, adj:["Aeg","Eas","Con","Ank","Arm","Syr"]},
  "Spa": {name:"Spain", type:"land", coast:true, sc:true, x:335.5, y:1039.0, adj:["MAO","Wes","Lyo","Por","Gas","Mar"]},
  "Spa-nc": {name:"Spain (North Coast)", type:"land", coast:true, sc:true, x:289.0, y:965.0, adj:["MAO","Por","Gas"]},
  "Spa-sc": {name:"Spain (South Coast)", type:"land", coast:true, sc:true, x:291.0, y:1166.0, adj:["Wes","Lyo","Por","Mar"]},
  "StP": {name:"St Petersburg", type:"land", coast:true, sc:true, x:1166.5, y:405.0, adj:["Bar","Bot","Nwy","Fin","Lvn","Mos"]},
  "StP-nc": {name:"St Petersburg (North Coast)", type:"land", coast:true, sc:true, x:1218.0, y:222.0, adj:["Bar","Nwy"]},
  "StP-sc": {name:"St Petersburg (South Coast)", type:"land", coast:true, sc:true, x:1066.0, y:487.0, adj:["Bot","Fin","Lvn"]},
  "Swe": {name:"Sweden", type:"land", coast:true, sc:true, x:829.5, y:459.0, adj:["Bot","Bal","Ska","Den","Nwy","Fin"]},
  "Swi": {name:"Switzerland", type:"neutral", coast:false, sc:false, x:642.0, y:928.0, adj:[]},
  "Syr": {name:"Syria", type:"land", coast:true, sc:false, x:1452.5, y:1206.0, adj:["Eas","Smy","Arm"]},
  "Tri": {name:"Trieste", type:"land", coast:true, sc:true, x:825.5, y:996.0, adj:["Adr","Ven","Tyr","Vie","Bud","Ser","Alb"]},
  "Tun": {name:"Tunis", type:"land", coast:true, sc:true, x:622.5, y:1300.0, adj:["Wes","Tys","Ion","NAf"]},
  "Tus": {name:"Tuscany", type:"land", coast:true, sc:false, x:686.5, y:1034.0, adj:["Lyo","Tys","Pie","Ven","Rom"]},
  "Tyr": {name:"Tyrolia", type:"land", coast:false, sc:false, x:742.5, y:904.0, adj:["Mun","Boh","Vie","Tri","Ven","Pie"]},
  "Tys": {name:"Tyrrhenian Sea", type:"sea", x:698.5, y:1149.1, adj:["Lyo","Wes","Ion","Tun","Tus","Rom","Nap"]},
  "Ukr": {name:"Ukraine", type:"land", coast:false, sc:false, x:1124.5, y:800.0, adj:["Gal","War","Mos","Sev","Rum"]},
  "Ven": {name:"Venice", type:"land", coast:true, sc:true, x:707.5, y:994.0, adj:["Adr","Apu","Rom","Tus","Pie","Tyr","Tri"]},
  "Vie": {name:"Vienna", type:"land", coast:false, sc:true, x:855.5, y:864.0, adj:["Tyr","Boh","Gal","Bud","Tri"]},
  "Wal": {name:"Wales", type:"land", coast:true, sc:false, x:428.5, y:658.0, adj:["Iri","Eng","Lvp","Yor","Lon"]},
  "War": {name:"Warsaw", type:"land", coast:false, sc:true, x:983.5, y:740.0, adj:["Sil","Pru","Lvn","Mos","Ukr","Gal"]},
  "Wes": {name:"Western Mediterranean", type:"sea", x:462.5, y:1163.0, adj:["MAO","Lyo","Tys","NAf","Tun","Spa","Spa-sc"]},
  "Yor": {name:"Yorkshire", type:"land", coast:true, sc:false, x:492.5, y:616.0, adj:["Nth","Edi","Lvp","Wal","Lon"]}
};


// --- Map background config (file lives alongside map.js) ---
// Set the filename (or relative path) of your PNG background:
const MAP_BG_IMAGE = 'map.png'; // e.g., 'map.png' in the same folder

// Match the SVG's viewBox to ensure the image fills the board exactly:
const MAP_BG_SIZE = { width: 1835, height: 1360 };

// Export so app.js can read them
window.MAP_BG_IMAGE = MAP_BG_IMAGE;
window.MAP_BG_SIZE  = MAP_BG_SIZE;


// Starting units & ownership
let START_UNITS = [
  { id:"ENG_F_Edi", power:"ENG", kind:"F", prov:"Edi" },
  { id:"ENG_A_Lvp", power:"ENG", kind:"A", prov:"Lvp" },
  { id:"ENG_F_Lon", power:"ENG", kind:"F", prov:"Lon" },
  { id:"FRA_A_Par", power:"FRA", kind:"A", prov:"Par" },
  { id:"FRA_A_Mar", power:"FRA", kind:"A", prov:"Mar" },
  { id:"FRA_F_Bre", power:"FRA", kind:"F", prov:"Bre" },
  { id:"GER_A_Ber", power:"GER", kind:"A", prov:"Ber" },
  { id:"GER_A_Mun", power:"GER", kind:"A", prov:"Mun" },
  { id:"GER_F_Kie", power:"GER", kind:"F", prov:"Kie" },
  { id:"ITA_A_Rom", power:"ITA", kind:"A", prov:"Rom" },
  { id:"ITA_A_Ven", power:"ITA", kind:"A", prov:"Ven" },
  { id:"ITA_F_Nap", power:"ITA", kind:"F", prov:"Nap" },
  { id:"AUS_A_Vie", power:"AUS", kind:"A", prov:"Vie" },
  { id:"AUS_A_Bud", power:"AUS", kind:"A", prov:"Bud" },
  { id:"AUS_F_Tri", power:"AUS", kind:"F", prov:"Tri" },
  { id:"RUS_A_War", power:"RUS", kind:"A", prov:"War" },
  { id:"RUS_A_Mos", power:"RUS", kind:"A", prov:"Mos" },
  { id:"RUS_F_Sev", power:"RUS", kind:"F", prov:"Sev" },
  { id:"RUS_F_StP", power:"RUS", kind:"F", prov:"StP-sc" },
  { id:"TUR_A_Con", power:"TUR", kind:"A", prov:"Con" },
  { id:"TUR_A_Smy", power:"TUR", kind:"A", prov:"Smy" },
  { id:"TUR_F_Ank", power:"TUR", kind:"F", prov:"Ank" },
];
let START_OWNERSHIP = {}; POWERS.forEach(p=> p.homes.forEach(h=> START_OWNERSHIP[h] = p.id));

// Export to window to avoid undefined in guards
window.POWERS = POWERS; window.PROVINCES = PROVINCES; window.START_UNITS = START_UNITS; window.START_OWNERSHIP = START_OWNERSHIP; window.byPower = byPower;
