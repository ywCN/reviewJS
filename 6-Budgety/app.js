// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            // create new item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // push the item into our data structure
            data.allItems[type].push(newItem);
            
            // return the item
            return newItem;
        },
        
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() { // just for testing
            console.log(data);
        }
    }

})();

// UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = { // make maintance easier
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };
    
    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create HTML string with placeholder text
            // % for not replacing something else accidentally
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // returns a list
            
            fieldsArr = Array.prototype.slice.call(fields); // convert list to array; list does not have slice() method
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            // set focus back
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        getDOMstrings: function() { // to make DOMstrings public
            return DOMstrings;
        }
    }
})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setUpEventlisteners = function() {
        var DOM = UICtrl.getDOMstrings(); // get object from other controller. DO NOT forget ()

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); // callback
    
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) { // 'which' is for older browers
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    var updateBudget = function() {
        var budget;
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return the budget
        budget = budgetCtrl.getBudget();
        
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };
        
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. get the filled input data
        input = UICtrl.getinput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the field
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // traverse up to get the info in id property
        
        if (itemID) {
            
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];
            
            // 1. delete the item from the data structure
            
            
            // 2. delete the item from the UI
            
            
            // 3. update and show the new budget
        }
    };
    
    return {
        init: function() {
            console.log('APP has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventlisteners();
        }
    }

})(budgetController, UIController);



controller.init(); // the only line outside











