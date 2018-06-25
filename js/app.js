 var dataManipulator = (function(){
 	var Income = function(ID,description,amount){
 		this.ID =ID;
 		this.description = description;
 		this.amount = amount;
 	};

 	var Expenses = function(ID,description,amount){
 		this.ID = ID;
 		this.description = description;
 		this.amount = amount;
 	};

 	Expenses.prototype.calcPercent = function(){
 		if(data.totalSum.inc > 0){
 			this.percentage = (this.amount/data.totalSum.inc)*100;
 		}else{
 			this.percentage = -1;
 		}
 		return this.percentage;
 	};
 	var calcTotal = function(type){
 		var sum = 0;
 		data.allObj[type].forEach(function(el){
 			sum += el.amount; 
 		});
 		data.totalSum[type] = sum;
 	}

 	var data = {
 		allObj:{
 			inc:[],
 			exp:[],
 		},
 		totalSum:{
 			inc:0,
 			exp:0,
 		},
 		budget:0,
 		percentageIncTotal:0,
 	};

 	return{
 		creatingItem:function(type,description,val){
 			var item,ID;
 			if(data.allObj[type].length != 0){
 				ID = data.allObj[type][data.allObj[type].length-1].ID + 1;
 			}else{
 				ID = 0;
 			}
 			if(type == 'inc'){
 				item = new Income(ID,description,val);
 			}else if(type == 'exp'){
 				item = new Expenses(ID,description,val);
 			}
 			data.allObj[type].push(item);
 			return item;
 		},
 		calculateBudget:function(){
 			calcTotal('inc');
 			calcTotal('exp');
 			data.budget = data.totalSum.inc - data.totalSum.exp;
 			if(data.totalSum.inc > 0){
 				data.percentageIncTotal =(data.totalSum.exp/data.totalSum.inc)*100;
 			}else{
 				data.percentageIncTotal = -1;
 			}
 		},
 		returnBudget:function(){
 			return{
 				budget:data.budget,
 				totalInc:data.totalSum.inc,
 				totalExp:data.totalSum.exp,
 				totalPercentage:data.percentageIncTotal,
 			}
 		},
 		deletingItem:function(type,ID){
 			var arrID = data.allObj[type].map(function(el){ //[ 1 2 3 4] or [1 4 6 9]
 				return el.ID;
 			});
 			var index = arrID.indexOf(ID);
			data.allObj[type].splice(index,1);		
 		},
 		getPercentages:function(){
 			var arrPercent = data.allObj.exp.map(function(el){
 				return el.calcPercent();
 			});
 			return arrPercent;
 		},
 		testData:function(){
 			return data;
 		}
 	}
 })();

 var UIController = (function(){
 	// чтобы не повторяться
 	var DOMStrings = {
 		select:'.plus-or-minus',
 		description:'.add-description',
 		amount:'.evaluation',
 		btn:'.add',
 		inc:'.column-list-inc',
 		exp:'.column-list-exp',
 		budgetLabel:'.budget-label',
 		digitsSumInc:'.digits-sum-inc',
 		digitsSumExp:'.digits-sum-exp',
 		totalPercentage:'.percentage-of-inc',
 		wrapperXButton:'.table-view',
 		percentage:'.percentage-inc',
 		budgetTitle:'.budget-title',
 	};
 	
 	/*
	Если мы создадим объект inputValue и впишем то что возвращает getIUnputValue,то оно всегда будет 
	возвращать начальный значения объекта при открытии страницы то есть 'inc','','' потому что IIFE 
	сразу ж выполняются  и все инпуты пустые!!!
 	*/
 	var formattingNumbers = function(number){
 		var int,dec,numberArr;
 		number = number.toFixed(2);
 		numberArr = number.split('.');
 		int = numberArr[0];
 		if(int.length > 3){
 			int = int.substring(0,int.length - 3) + ',' + int.substring(int.length - 3,int.length)
 		}
 		dec = numberArr[1];
 		return int + '.' + dec;
 	};

 	return{
 		getDOMStrings: function(){
 			return DOMStrings; //чтобы достать в eventController
 		},
 		getInputValue: function(){
 			//получаем дату от пользователя
 			return{
 				selectValue: document.querySelector(DOMStrings.select).value,
 				descriptionValue: document.querySelector(DOMStrings.description).value,
 				amountValue: +document.querySelector(DOMStrings.amount).value ,
 			}
 		},
 		putItemIntoUI:function(type,item){
 			var columnList,html,newHtml;
 			if(type == 'inc'){
 				html ='<div class="row-item green-border" id="inc-%item.ID%"><h3>%item.description%</h3><button class="x-but"><ion-icon class="income" name="ios-close"></ion-icon></button><span class="income">+%item.amount%</span></div>';
 			}else if(type == 'exp'){
 				html ='<div class="row-item pink-border" id="exp-%item.ID%"><h3>%item.description%</h3><button class="x-but"><ion-icon class="expenses" name="ios-close"></ion-icon></button><div class="percentage-inc expenses">400%</div><span class="expenses expenses-span">-%item.amount%</span></div>'
 			}
 			newHtml = html.replace('%item.ID%', item.ID);
 			newHtml = newHtml.replace('%item.description%',item.description);
 			newHtml = newHtml.replace('%item.amount%',formattingNumbers(item.amount));
 			document.querySelector(DOMStrings[type]).insertAdjacentHTML('afterbegin',newHtml);
 		},
 		cleanInput:function(){
 			var fields,fieldsArr;
 			fields = document.querySelectorAll(DOMStrings.description + ',' + DOMStrings.amount);
 			fieldsArr = Array.prototype.slice.call(fields);
 			fieldsArr.forEach(function(el){
 				el.value = '';
 			});
 			fieldsArr[0].focus();
 		},
 		putBudgetIntoUI:function(obj){
 			document.querySelector(DOMStrings.budgetLabel).textContent = formattingNumbers(obj.budget) ;
 			document.querySelector(DOMStrings.digitsSumInc).textContent = '+ ' + formattingNumbers(obj.totalInc);
 			document.querySelector(DOMStrings.digitsSumExp).textContent = '- ' + formattingNumbers(obj.totalExp);
 			if(obj.totalPercentage != -1){
 				document.querySelector(DOMStrings.totalPercentage).textContent = formattingNumbers(obj.totalPercentage) + ' %';
 			}else {
 				document.querySelector(DOMStrings.totalPercentage).textContent = '---';
 			}

 		},
 		displayPercentages:function(percentages){
 			var list,arr;
 			list = document.querySelectorAll(DOMStrings.percentage);
 			arr = Array.prototype.slice.call(list);
 			arr.forEach( function(element, index) {
 				if(percentages[percentages.length - 1 - index] > 0){
 					element.textContent = formattingNumbers(percentages[percentages.length - 1 - index]) + ' %';
 				}else{
 					element.textContent = '---';
 				}
 			});
 		},
 		displayDate:function(){
 			var now,month,months,years;
 			now = new Date();
 			year = now.getFullYear();
 			months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
 			month = months[now.getMonth()];
 			document.querySelector(DOMStrings.budgetTitle).textContent = 'Available budget in ' + month + ' ' + year + ':';
 		},
 		toggleColor:function(){
 			var list = document.querySelectorAll(DOMStrings.select + ',' + DOMStrings.description + ',' + DOMStrings.amount );
 			var arr = Array.prototype.slice.call(list);
 			arr.forEach( function(el, index) {
 				el.classList.toggle('can-change');
 			});
 			document.querySelector(DOMStrings.btn).classList.toggle('expenses');
 		}
 	}
 })();

 var eventController = (function(dataMr,uiCtrlr){
 	 var dom = uiCtrlr.getDOMStrings();
 	//создание заголовка с бюджетом и его выведения на экран
 	var budgetLabelGenerator = function(){
 		dataMr.calculateBudget();
 		var objectBudget = dataMr.returnBudget();
 		//функция для передачи данных в уи с аргументом-объектом которая также будет в инит функции
 		uiCtrlr.putBudgetIntoUI(objectBudget);
 	}
 	var percentagesGenerator = function(){
 		var percentages;
 		percentages = dataMr.getPercentages();
 		uiCtrlr.displayPercentages(percentages);
 		
 	}
 	//оброботка данных,создание Items в dataManipulator, UIController,вывод на экраны
 	var controlAddingItems = function(){
 		var input = uiCtrlr.getInputValue();
 		if(input.amountValue > 0 && !isNaN(input.amountValue)){

 			var item = dataMr.creatingItem(input.selectValue,input.descriptionValue,input.amountValue);
 		
 			var UiItem = uiCtrlr.putItemIntoUI(input.selectValue,item);

 			budgetLabelGenerator();
 			percentagesGenerator();

 		}

 		uiCtrlr.cleanInput();
 	}
 	var controlDeletingItems = function(e){
 		var item,stringID,arrID,type,ID;
 		item = e.target.parentNode.parentNode;
 		stringID = item.id;
 		if(stringID){
 			arrID = stringID.split('-');
	 		type = arrID[0];
	 		ID = +arrID[1];
	 		dataMr.deletingItem(type,ID); // we deleted from the database
	 		item.parentNode.removeChild(item); // we delete that item
	 		budgetLabelGenerator(); // refresh budget
	 		percentagesGenerator();// refresh percentages
 		}
 	}
 	//слушаем кнопку "готово" и "энтер"
 	var allEventListeners = function(){
 		document.querySelector(dom.btn).addEventListener('click',controlAddingItems,{passive: true});
 		document.addEventListener("keyup",function(e){
 			if(e.keyCode == 13 || e.which == 13){
 				controlAddingItems();
 			}
 		},{passive: true});
 		document.querySelector(dom.wrapperXButton).addEventListener('click',controlDeletingItems,{passive: true});
 		document.querySelector(dom.select).addEventListener('change',uiCtrlr.toggleColor,{passive: true});
 	};

 	return {
 		// для запуска програмку
 		initListen: function(){
 			allEventListeners();
 			uiCtrlr.putBudgetIntoUI({
 				budget:0,
 				totalInc:0,
 				totalExp:0,
 				totalPercentage:0,
 			});
 			uiCtrlr.displayDate();
 		}
 	}
 })(dataManipulator,UIController);

 eventController.initListen();