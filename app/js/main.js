// ============================
// MAIN CODE
// ============================

var db = new PouchDB('users');


const mainActive  = 'main_active',
      slotsActive = 'slots_active',
      drumRing    = '.slots-main__drum-ring',
      drumSlot    = '.slots-main__drum-slot',
      tableRow    = '.slots-top__table-row',
      tableRowWin = 'slots-top__table-row_blink',
      coinLine    = '.slots-main__coin-line',
      coinLineOn  = 'slots-main__coin-line_active',
      coinLineWin = 'slots-main__coin-line_blink';


const app = new Vue({
   el: '#app',
   data: {
      // ===== COMMON =====
      gamblingSectionShow: false,
      modalSubNameCurrent: null,
      userFound: false,
      questionCorrect: false,
      modalMessages: '',
      modalOther: false,
      topUsers: [],
      combSeven: false,
      // ===== USER =====
      userName: '',
      userNameHidden: '',
      userPass: '',
      userHint: '',
      userHintHidden: '',
      userBank: '',
      // ===== PERSONAL =====
      userRate:  0,
      userWin:   0,
      userLoss:  0,
      userRatio: 0,
      userSpins: 0,
      userRate1: 0,
      userRate2: 0,
      userRate3: 0,
      userWinsCoin1: 0,
      userWinsCoin2: 0,
      userWinsCoin3: 0,
      // ===== INFO =====
      coinsPlayed:   0,
      credits:       0,
      creditsHidden: 0,
      winnerPaid:    0,
      // ===== BUTTONS =====
      btnCashOut: false,
      btnPlayMax: false,
      btnSpin:    false,
      btnBetOne:  false,
      // ===== SPIN =====
      drumsRing:     document.querySelectorAll(drumRing),
      drumsSlots:    document.querySelectorAll(drumSlot),
      degrees:       [0, 45, 90, 135, 180, 225, 270, 315, 360],
      spinTime:      4000,
      spinAvialable: false,
      spinRepeat:    false,
      spinPred:      true,
      // ===== COMB =====
      tableRows:     document.querySelectorAll(tableRow),
      coinLinesTemp: {},
      coinLines:     {},
      combs: {
         comb7: [{slot1: 'seven',      slot2: 'seven',      slot3: 'seven'},      10000],
         comb6: [{slot1: 'watermelon', slot2: 'watermelon', slot3: 'watermelon'}, 100],
         comb5: [{slot1: 'bell',       slot2: 'bell',       slot3: 'bell'},       50],
         comb4: [{slot1: 'lemon',      slot2: 'lemon',      slot3: 'lemon'},      20],
         comb3: [{slot1: 'orange',     slot2: 'orange',     slot3: 'orange'},     10],
         comb2: [{slot1: 'cherry',     slot2: 'cherry'},                          7],
         comb1: [{slot1: 'cherry'},                                               5]
      }
   },
   methods: {

      // ===== COMMON SECTION =====
      openModal(modalName, modalSubName) {
         let modalThis = eval(`this.$refs.${modalName}`);
         
         if (modalName === 'modalEnter') {
            app.modalSubNameCurrent = modalSubName;

            $.fancybox.open(modalThis, {
               modal: true,
               animationDuration: '400',
               animationEffect: 'slide-in-out',
               beforeShow: () => {                 
                  if (app.modalSubNameCurrent === 'signin') {
                     app.modalMessages = 'Введите Ваше имя...'
                  } else if (app.modalSubNameCurrent === 'signup') {
                     app.modalMessages = 'Сначала укажите Ваше имя...'
                  }
               },
               afterClose: () => {
                  app.clearModal();
               }
            });
         } else if (modalName === 'modalAccount') {
            $.fancybox.open(modalThis, {
               modal: true,
               animationDuration: '400',
               animationEffect: 'slide-in-out',
               beforeShow: () => {
                  app.modalMessages = 'Укажите сумму которую хотите добавить в игровой автомат...'
               },
               afterClose: () => {
                  app.userRate = 0;
               }
            });
         } else if (modalName === 'modalProfile') {
            $.fancybox.open(modalThis, {
               modal: true,
               animationDuration: '400',
               animationEffect: 'slide-in-out'
            });
         } else if (modalName === 'modalRules') {
            $.fancybox.open(modalThis, {
               modal: true,
               animationDuration: '400',
               animationEffect: 'slide-in-out'
            });
         }

      },

      clearModal() {
         app.userName = '';
         app.userPass = '';
         app.userHint = '';
         app.userFound = false;
      },

      spotUser() {
         db.allDocs({
            include_docs: true,
            attachments: true
         }).then((result) => {
            app.searchDB(result.rows);
         });
      },

      searchDB(docs) {
         let res = _.find(docs, (o) => {
            return o.doc.userName === app.userName;
         });

         if (app.modalSubNameCurrent === 'signin') {
            app.oldUser(res);
         } else if (app.modalSubNameCurrent === 'signup') {
            app.newUser(res);
         }
      },

      newUser(res) {
         if (res) {
            let message = ['Это имя уже занято другим игроком...', 'К сожалению, с таким именем уже существует игрок!', 'А вот с таким именем уже есть игрок! Добавьте уникальности...']
            app.modalMessages = message[getRandom(0, message.length)];
            app.userFound = false;
         } else if (!res && app.userName === '') {
            let message = ['Нужно указать имя...', 'Без имени не получиться начать игру!', 'Поле с именем не должно быть пустым!']
            app.modalMessages = message[getRandom(0, message.length)];
            app.userFound = false;
         } else if (!res && app.userName !== '') {
            app.modalMessages = 'Отлично! Задайте пароль и придумайте подсказку к нему. Без пароля, в будущем, не возможно будет войти в игру под указаным Вами именем...';
            app.userFound = true;
         }
      },

      oldUser(res) {
         if (app.userName === '') {
            let message = ['Пожалуйста, введите имя...', 'Впишите имя, которое Вы указывали при регистрации!', 'Для того чтобы продолжить, нужно ввести имя!']
            app.modalMessages = message[getRandom(0, message.length)];
         } else if (res) {
            app.modalMessages = 'Укажите Ваш пароль...'; 
            app.userFound = true;
            
            db.get(app.userName).then((doc) => {
               app.userHint = doc.userHint;
               app.userPassHidden = doc.userPass;
               app.userNameHidden = doc.userName;
               app.userBank = doc.userBank;
               app.userSpins = doc.userSpins;
               app.userRate1 = doc.userRate1;
               app.userRate2 = doc.userRate2;
               app.userRate3 = doc.userRate3;
               app.userWinsCoin1 = doc.userWinsCoin1;
               app.userWinsCoin2 = doc.userWinsCoin2;
               app.userWinsCoin3 = doc.userWinsCoin3;
            });
         } else {
            app.modalMessages = 'Нет игрока с таким именем! Проверьте корректность имени или станьте новым игроком с таким именем...';
            app.userFound = false;            
         }
      },

      addUser(userName, userPass, userHint) {
         db.put({
            _id: userName,
            userName: userName,
            userBank: 500,
            userSpins: 0,
            userRate1: 0,
            userRate2: 0,
            userRate3: 0,
            userWinsCoin1: 0,
            userWinsCoin2: 0,
            userWinsCoin3: 0,
            userPass: userPass,
            userHint: userHint
         });

         db.get(app.userName).then((doc) => {
            app.userNameHidden = doc.userName;
            app.userBank = doc.userBank;
            app.userSpins = doc.userSpins;
            app.userRate1 = doc.userRate1; 
            app.userRate2 = doc.userRate2; 
            app.userRate3 = doc.userRate3;
            app.userWinsCoin1 = doc.userWinsCoin1;
            app.userWinsCoin2 = doc.userWinsCoin2;
            app.userWinsCoin3 = doc.userWinsCoin3;
         });
      },

      preGame() {
         if (app.modalSubNameCurrent === 'signin') {

            if (app.userPassHidden === app.userPass) {
               let message = ['С возвращением!', 'Добро пожаловать!', 'Ура! Вы вернулись!']
               app.modalMessages = message[getRandom(0, message.length)];
               app.onGame();
               $.fancybox.close();
            } else {
               let message = ['Пароль не верный!', 'В пароле ошибка! Вы точно владелец этого аккаунта?', 'Пароль не верный! Вспоминайте... '];
               app.modalMessages = message[getRandom(0, message.length)];
            }
            
         } else if (app.modalSubNameCurrent === 'signup') {
            
            if (app.userFound) {
               if (app.userPass.length === 0) {
                  let messages = ['Пожалуйста введите пароль...', 'Необходимо все же указать пароль!', 'Без пароля дальше никак :('];
                  app.modalMessages = messages[getRandom(0, messages.length)];
               } else if (app.userPass.length > 0 && app.userPass.length < 3 ) {
                  app.modalMessages = 'Вы считаете это паролем? Введите минимум 3 символа!';
               } else if (app.userHint <= 0) {
                  app.modalMessages = 'Объязательно укажите подсказу, если забудете пароль, востановить его не получиться!'
               } else if (app.userHint === app.userPass) {
                 app.modalMessages = 'Подсказка не может совпадать с паролем...'
               }  else {
                  app.modalMessages = 'Ура! Добро пожаловать!'
                  app.addUser(app.userName, app.userPass, app.userHint);
                  app.onGame();
                  $.fancybox.close();
                  setTimeout(() => {
                     app.openModal('modalRules');
                  }, 2750);
               }
            } else {
               app.spotUser();
            }
         }

      },

      onGame() {
         app.gamblingSectionShow = true;
      
         setTimeout(() => {
            app.$refs.main.classList.add(mainActive);
         }, 800);
         
         setTimeout(() => {
            app.$refs.slots.classList.add(slotsActive);
            document.querySelectorAll('.common-section__decor').forEach((elem) => {elem.classList.add('common-section__decor_no-active')});
            document.querySelectorAll('.gambling-section__decor').forEach((elem) => {elem.classList.add('gambling-section__decor_active')});
         }, 1000)
         
         setTimeout(() => {
            document.querySelectorAll(tableRow).forEach((elem) => {elem.classList.add('slots-top__table-row_no-active')});
         }, 3000);

      },

      offGame() {
         this.$refs.slots.classList.remove(slotsActive)

         setTimeout(() => {
            app.$refs.main.classList.remove(mainActive);
            document.querySelectorAll('.common-section__decor').forEach((elem) => {elem.classList.remove('common-section__decor_no-active')});
            document.querySelectorAll('.gambling-section__decor').forEach((elem) => {elem.classList.remove('gambling-section__decor_active')});
         }, 150);

         setTimeout(() => {
            app.gamblingSectionShow = false;
            app.credits = 0;
         }, 2000);

         app.update();
      },

      // ===== GAMBLING SECTION =====
      onSpin() {
         if (app.userRate > 0) {
            app.userBank -= app.userRate;
            app.userRate -= 0; 
            app.credits += app.userRate;
            $.fancybox.close();
         } else {
            let messages = ['Пока сумма ставки "0", начать игру не возможно!', 'Необходимо указать сумму ставки больше текущей...', 'Укажите сумму ставки выше "0"...'];
            app.modalMessages = messages[getRandom(0, messages.length)];            
         }
      },

      spin() {
         app.spinAvialable = false;

         app.coinLinesTemp = {};
         app.coinLines = {};

         app.drumsRing.forEach((elem, i) => {
            let drumSlots   = window[`drumSlots${i + 1}`],
                drumRingDeg = window[`drumRingDeg${i + 1}`],
                preSlot     = window[`preSlot${i + 1}`],
                curSlot     = window[`curSlot${i + 1}`],
                posSlot     = window[`posSlot${i + 1}`],
                deg         = drumRingDeg;  
                
            if (app.spinPred) {
               
               let arrDs = drumSlots.slice(drumSlots.indexOf(curSlot) - 1);
            
               arrDs.push.apply(arrDs, drumSlots);

               let comb = null;

               if (!app.combSeven) {
                  comb = _.findIndex(arrDs, {name: eval(`app.combs.comb${getRandom(1, 4)}[0].slot1`)});
               } else {
                  comb = _.findIndex(arrDs, {name: eval(`app.combs.comb${7}[0].slot1`)});                  
               }

               drumRingDeg -= (45 * (comb - 1)) + (360 * getRandom(1, 10));

               window[`drumRingDeg${i + 1}`] = drumRingDeg;

               curSlot = arrDs[comb];
               preSlot = arrDs[comb + 1];
               if (arrDs[comb - 1]) posSlot = arrDs[comb - 1];

               window[`preSlot${i + 1}`] = preSlot;
               window[`curSlot${i + 1}`] = curSlot;
               window[`posSlot${i + 1}`] = posSlot;
            
            } else {
               
               drumRingDeg -= app.degrees[getRandom(0, app.degrees.length)] * getRandom(1, 50);
            
               window[`drumRingDeg${i + 1}`] = drumRingDeg;

               let sum   = drumRingDeg - deg,
                   count = Math.abs(sum / 45),
                   arrDs = drumSlots.slice(drumSlots.indexOf(curSlot));

               for (let i = 0; i <= count; i++) {
                  arrDs.push.apply(arrDs, drumSlots);
                  curSlot = arrDs[i];

                  if (sum < 0) {
                     preSlot = arrDs[i + 1];
                     posSlot = arrDs[i - 1];
                  }
               }

               window[`preSlot${i + 1}`] = preSlot;
               window[`curSlot${i + 1}`] = curSlot;
               window[`posSlot${i + 1}`] = posSlot;

            }
            
            app.fill(i, preSlot, curSlot, posSlot);

            if (i === app.drumsRing.length - 1) {
               let coins = [];

               app.check(coins);

               coins = getUnique(coins, 'coin');
                              
               if (app.spinRepeat) {
                  app.spin();
                  return app.spin;
               } else {
                  app.rotate();
                  app.win(coins);
                  app.userSpins++;
                  
                  if (app.coinsPlayed === 1) app.userRate1++;
                  if (app.coinsPlayed === 2) app.userRate2++;
                  if (app.coinsPlayed === 3) app.userRate3++;
               }
               
            }
         });         
      },  

      fill(i, preSlot, curSlot, posSlot) {
         if (i === 0) {
            app.coinLinesTemp.coin1 = {};
            app.coinLinesTemp.coin2 = {};
            app.coinLinesTemp.coin3 = {};
            app.coinLinesTemp.coin1.slot1 = curSlot.name;
            app.coinLinesTemp.coin2.slot1 = preSlot.name;
            app.coinLinesTemp.coin3.slot1 = posSlot.name;
         } else if (i === 1) {   
            app.coinLinesTemp.coin1.slot2 = curSlot.name;
            app.coinLinesTemp.coin2.slot2 = curSlot.name;
            app.coinLinesTemp.coin3.slot2 = curSlot.name;
         } else if (i === 2) {
            app.coinLinesTemp.coin1.slot3 = curSlot.name;
            app.coinLinesTemp.coin2.slot3 = posSlot.name;
            app.coinLinesTemp.coin3.slot3 = preSlot.name;
         }

         if (app.coinsPlayed === 1) {
            app.coinLines.coin1 = app.coinLinesTemp.coin1;
         } else if (app.coinsPlayed === 2) {
            app.coinLines.coin1 = app.coinLinesTemp.coin1;   
            app.coinLines.coin2 = app.coinLinesTemp.coin2;
         } else if (app.coinsPlayed === 3) {
            app.coinLines.coin1 = app.coinLinesTemp.coin1;   
            app.coinLines.coin2 = app.coinLinesTemp.coin2;
            app.coinLines.coin3 = app.coinLinesTemp.coin3;
         }
      },

      check(coins) {
         let comb      = '',
             curIndex  = 0,
             combsSize = Object.keys(app.combs).length;
         
         app.spinRepeat = false;
         app.spinPred = false;

         for (key in app.combs) {
            curIndex++;
            
            let combFound = false;
            
            comb = _.findKey(app.coinLines, app.combs[key][0]);

            if (app.userRatio > .75) {
               
               if (comb && key !== key) {
                  coins.push({coin: comb, comb: key});
               } else if (comb && key === key) {
                  app.spinRepeat = true;
                  app.spinPred = false;
               }

            } else if (app.userRatio >= .4 && app.userRatio <= .75) {
               
               if (comb && key !== 'comb7') {
                  coins.push({coin: comb, comb: key});
               } else if (comb && key === 'comb7') {
                  app.spinRepeat = true;
                  app.spinPred = false;
               }

            } else if (app.userRatio < .4) {
               
               if (comb) {
                  combFound = true;
               }
               
               if (combFound === true) {
                  coins.push({coin: comb, comb: key});                  
                  continue;
               } else if (combFound === false) {
                  if (curIndex !== combsSize) {
                     continue;
                  } else if (curIndex === combsSize && coins.length === 0) {
                     app.spinRepeat = true;
                     app.spinPred = true;
                  }
               }

            }            
         }

      },

      rotate() {
         app.drumsRing.forEach((elem, i) => {
            eval(`this.$refs.drumRing${i + 1}`).style.transform = `rotateX(${window[`drumRingDeg${i + 1}`]}deg)`;
         });
      },

      win(coins) {
         setTimeout(() => {
            coins.forEach((elem) => {
               eval(`app.$refs.${elem.coin}`).classList.add(coinLineWin);
               eval(`app.$refs.${elem.comb}`).classList.add(tableRowWin);
               app.winnerPaid += eval(`app.combs.${elem.comb}[1]`);
               if (elem.coin === 'coin1') app.userWinsCoin1++;
               if (elem.coin === 'coin2') app.userWinsCoin2++;
               if (elem.coin === 'coin3') app.userWinsCoin3++;

               if (elem.comb === 'comb7') {
                  var end = Date.now() + (15 * 1000);
                  var colors = ['#FFA500', '#008000', '#FF0000'];

                  (function frame() {
                      confetti({
                          particleCount: 3,
                          angle: 60,
                          spread: 55,
                          origin: {
                              x: 0
                          },
                          colors: colors
                      });
                      confetti({
                          particleCount: 3,
                          angle: 120,
                          spread: 55,
                          origin: {
                              x: 1
                          },
                          colors: colors
                      });
                   
                      if (Date.now() < end) {
                          requestAnimationFrame(frame);
                      }
                  }());

                  app.combSeven = false;
               }
            });

         }, app.spinTime);
         
         setTimeout(() => {
            app.resetElem(coinLine, coinLineWin);
            app.resetElem(tableRow, tableRowWin);
         }, app.spinTime * 2);
         
         app.reset();
      },

      reset() {
         setTimeout(() => {
            
            app.userLoss += app.coinsPlayed;

            app.credits = app.creditsHidden;
            app.credits += app.winnerPaid;
            app.coinsPlayed = 0;
            app.spinAvialable = true;

            document.querySelectorAll(coinLine).forEach((elem) => {elem.classList.remove(coinLineOn)})
         
         }, app.spinTime);
      },

      resetElem(selector, removeSelector) {
         document.querySelectorAll(selector).forEach((elem) => {elem.classList.remove(removeSelector)});
      },

      click(btn) {
         if (btn === 'btnCashOut') {
            if (app.spinAvialable) {
               app.creditsHidden = (app.coinsPlayed > 0) ? app.creditsHidden + app.coinsPlayed : app.creditsHidden;
               
               app.credits = app.creditsHidden;
               
               app.userBank += app.credits;

               app.update();
               
               app.creditsHidden = 0;
               app.credits = 0;
               app.coinsPlayed = 0;
               app.winnerPaid = 0;

               app.spinAvialable = !app.spinAvialable;

               app.resetElem(coinLine, coinLineOn);
               app.resetElem(coinLine, coinLineWin);
               app.resetElem(tableRow, tableRowWin); 
               
               app.userWin = 0;
               app.userLoss = 0;
               app.userRatio = 1;
            }
         }

         if (btn === 'btnSpin') {
            if (app.coinsPlayed > 0 && app.spinAvialable) {
               app.spin();
               app.winnerPaid = 0;
            }
         }
         
         if (btn === 'btnPlayMax') {
            if (app.creditsHidden > 0 && app.spinAvialable) {
               if (app.creditsHidden < 3 && app.coinsPlayed !== 3) {
                  app.coinsPlayed += app.creditsHidden;
                  app.creditsHidden -= app.creditsHidden;
               } else if (app.creditsHidden >= 3) {
                  app.creditsHidden += app.coinsPlayed;
                  app.creditsHidden -= 3;
                  app.coinsPlayed = 3;
               }
               app.resetElem(coinLine, coinLineWin);
               app.resetElem(tableRow, tableRowWin);  
               app.spin();
               app.winnerPaid = 0;
            }
         }

         if (btn === 'btnBetOne') {
            if (app.creditsHidden > 0 && app.coinsPlayed < 3 && app.spinAvialable) {
               app.creditsHidden--;
               app.coinsPlayed++;
            }

            if (app.spinAvialable) {
               app.btnBetOne = (app.coinsPlayed === 3 || app.creditsHidden === 0) ? false : true;
            }
         }

      },

      update() {
         app.topUsers = [];
         
         db.get(app.userNameHidden).then((doc) => {
            doc.userBank = app.userBank;
            doc.userSpins = app.userSpins;
            doc.userRate1 = app.userRate1;
            doc.userRate2 = app.userRate2;
            doc.userRate3 = app.userRate3;
            doc.userWinsCoin1 = app.userWinsCoin1;
            doc.userWinsCoin2 = app.userWinsCoin2; 
            doc.userWinsCoin3 = app.userWinsCoin3; 
            return db.put(doc);
         });

         db.allDocs({
            include_docs: true,
            attachments: true
         }).then((result) => {
            usersList(result.rows);
         });
   
         function usersList(result) {
            let arr = [],
                obj = {};
   
            result.forEach((elem) => {
               obj = {
                  userName: elem.doc.userName,
                  userBank: elem.doc.userBank
               }
               arr.push(obj);
            });
   
            let topUsers = [];
   
            topUsers = arr.sort((a, b) => {
               let c = a.userBank,
                   d = b.userBank;
   
               if (c > d) {
                  return -1;
               } else if (c < d) {
                  return 1;
               }    
               return 0;
            }).slice(0, 5);
   
            app.topUsers = topUsers;
         }
      },

   },
   watch: {

      userName() {
         app.spotUser();
      },

      userRate(val, oldVal) {
         let rate = 0;
         
         if (val >= 0) {
            if (val > oldVal) {
               rate = val - oldVal;
               app.userBank -= rate;
               if (app.userBank < 0) app.userRate = 0;
            } else if (val < oldVal && val >= 0) {
               rate = oldVal - val;
               app.userBank += rate;
            }
         } else {
            app.userRate = 0;
         }
      },

      spinAvialable(val) {
         if (val) {
            app.btnCashOut = true;
            app.btnPlayMax = true;
            app.btnSpin = false;
            app.btnBetOne = true;
         } else {
            app.btnCashOut = false;
            app.btnPlayMax = false;
            app.btnSpin = false;
            app.btnBetOne = false;
         }
      },

      userLoss(val) {
         if (val > 0) {
            app.userRatio = (app.userWin / app.userLoss);
         } else {
            app.userRatio = 1;
         }
      },

      winnerPaid(val) {
         app.userWin += val;
      },

      coinsPlayed(val) {
         if (val > 0 && app.spinAvialable) app.btnSpin = true;

         if (val > 0) document.querySelectorAll(coinLine).forEach((elem) => {elem.classList.remove(coinLineWin)});

         for (let i = 0; i < val; i++) {
            eval(`app.$refs.coin${i + 1}`).classList.add(coinLineOn);
         }
      },

      credits(val) {
         app.creditsHidden = val;
         
         if (val !== 0) {
            app.spinAvialable = true;
            document.querySelectorAll(tableRow).forEach((elem) => {elem.classList.remove('slots-top__table-row_no-active')});            
         
         } else { 
            app.spinAvialable = false;
            app.userWin = 0;
            app.userLoss = 0;
            
            document.querySelectorAll(tableRow).forEach((elem) => {elem.classList.add('slots-top__table-row_no-active')});
         }
      }

   },
   created() {
      this.drumsRing.forEach((elem, i) => {
         window[`drumSlots${i + 1}`] = [];
			window[`curSlot${i + 1}`] = {};
			window[`preSlot${i + 1}`] = {};
			window[`posSlot${i + 1}`] = {};
         window[`drumRingDeg${i + 1}`] = 0;

         elem.setAttribute('ref', `drumRing${i + 1}`);

         let ds    = elem.querySelectorAll(drumSlot),
             arrDs = [];

         ds.forEach((item) => {
            let num  = item.getAttribute('data-num'),
                name = item.getAttribute('data-name'),
                data = {num: num, name: name};

            arrDs.push(data);    
         });
         
         window[`drumSlots${i + 1}`] = arrDs;
			window[`preSlot${i + 1}`] = arrDs[0];
			window[`curSlot${i + 1}`] = arrDs[arrDs.length - 1];
         window[`posSlot${i + 1}`] = arrDs[arrDs.length - 2];   
      });

      document.querySelectorAll(tableRow).forEach((elem, i, arr) => {elem.setAttribute('ref', `comb${arr.length - i}`)})
         
      db.allDocs({
         include_docs: true,
         attachments: true
      }).then((result) => {
         usersList(result.rows);
      });

      function usersList(result) {
         let arr = [],
             obj = {};

         result.forEach((elem) => {
            obj = {
               userName: elem.doc.userName,
               userBank: elem.doc.userBank
            }
            arr.push(obj);
         });

         let topUsers = [];

         topUsers = arr.sort((a, b) => {
            let c = a.userBank,
                d = b.userBank;

            if (c > d) {
               return -1;
            } else if (c < d) {
               return 1;
            }    
            return 0;
         }).slice(0, 5);

         app.topUsers = topUsers;
      }
   }
});


// ============================
// FUNCTION
// ============================


function getUnique(arr, comp) {
   let unique = arr.map(e => e[comp])
                   .map((e, i, final) => final.indexOf(e) === i && i)
                   .filter(e => arr[e]).map(e => arr[e]);
   return unique;
}


function getRandom(min, max) {
   return Math.floor(Math.random() * (max - min)) + min;
}


function r(min, max) {
   return Math.random() * (max - min) + min;
}