// Café 52 menu: every dish, price and diet mark. Used by the menu (index.html) and the staff screen (staff.html).
/* ---------- menu data ----------
   Tab → sections: [title, blurb, groups, add-on ids (from ADDONS below)]
   Group: [label or null, diet, [[no, name, price, diet?], ...]]
   diet: "v" veg · "n" non-veg · "e" contains egg (shown under non-veg with an EGG tag)
   The numbers are the dish numbers on the printed menu; the cart uses them as ids ("item-12"). */
const MENU = {
food: [
  ["Rolls", "Shawarma, fila, angara, tikka & shish taouk wraps", [
    ["Chicken", "n", [
      [1,"Chicken Shawarma Roll",120],[2,"Chicken Cheese Shawarma Roll",140],[3,"Chicken Shawarma With Hummus",130],
      [4,"Chicken Shawarma Falafel Roll With Hummus",150],[5,"Chicken Shawarma Roll",160],[6,"Chicken Shawarma Without Salad Roll",170],
      [7,"Fila Chicken Roll",140],[8,"Fila Chicken Roll Without Salad",160],[9,"Fila Chicken Cheese Roll",160],
      [10,"Fila Chicken Roll With Egg & Cheese",180],[11,"Angara Roll",130],[12,"Angara Cheese Roll",150],
      [13,"Angara Roll With Egg & Cheese",170],[14,"Chicken Tikka Roll",130],[15,"Chicken Tikka Cheese Roll",150],
      [16,"Chicken Tikka Roll With Egg & Cheese",170],[17,"Shish Taouk Roll",130],[18,"Cheese Shish Taouk Roll",150],
      [19,"Shish Taouk Roll With Egg & Cheese",170]]],
    ["Veg", "v", [
      [20,"Paneer Roll",130],[21,"Paneer Roll Without Salad",150],[22,"Paneer Cheese Roll",160],[23,"Mix Veg Roll",120],
      [24,"Mix Veg Roll With Cheese",140],[25,"Falafel Roll",140],[26,"Falafel Cheese Roll",160],[27,"Lebanese Masala Roll",120],
      [28,"Lebanese Masala Roll With Cheese",140],[29,"Veg Cutlet Roll",120],[30,"Veg Cutlet Roll With Cheese",140],
      [31,"Hummus Garlic Roll",110],[32,"Hummus Garlic Roll With Cheese",130]]]], ["garlic-s", "garlic", "mayo-s", "mayo", "spicy", "cheese", "salad", "fries", "pp-fries", "hummus"]],
  ["Plates", "Hummus, falafel & shawarma with pita", [
    ["Veg", "v", [
      [33,"Hummus Plate With 2 Pita Bread",200],[34,"Falafel Plate (4 + 2 Pita Bread) & Hummus",290],[35,"Hummus Falafel Plate",250]]],
    ["Chicken Shawarma", "n", [
      [36,"Chicken Shawarma Plate Without Salad",170],[37,"Chicken Shawarma Plate With Salad",200],
      [38,"Falafel Chicken Plate",320],[39,"Shahan Shawarma Plate",320]]]], ["pita", "garlic-s", "garlic", "mayo-s", "mayo", "spicy", "salad", "fries", "pp-fries", "hummus"]],
  ["Burgers", "Crispy, tikka & fries burgers", [
    ["Chicken", "n", [
      [40,"Chicken Burger",100],[41,"Chicken Cheese Burger",120],[42,"Chicken Burger With Egg & Cheese",150],
      [43,"Chicken Fries Burger",150],[44,"Chicken Fries Cheese Burger",170],[45,"Chicken Crispy Burger",150],
      [46,"Chicken Crispy Cheese Burger",170],[47,"Chicken Crispy Burger With Egg & Cheese",190],[48,"Chicken Tikka Burger",150],
      [49,"Chicken Tikka Cheese Burger",170],[50,"Chicken Burger With Egg & Cheese",190]]],
    ["Veg", "v", [
      [51,"Veg Burger",90],[52,"Veg Cheese Burger",110],[53,"Veg Fries Burger",130],[54,"Veg Fries Cheese Burger",150],
      [55,"Paneer Burger",140],[56,"Paneer Cheese Burger",160],[57,"Paneer Tikka Burger",160],[58,"Paneer Tikka Cheese Burger",180]]]], ["cheese", "garlic-s", "garlic", "mayo-s", "mayo", "spicy", "salad", "fries", "pp-fries", "hummus"]],
  ["Sandwiches", "Grilled, club & Bombay toast", [
    ["Non-veg", "n", [
      [59,"Chicken Cheese Grilled Sandwich",110],[60,"Non Veg Club Sandwich",150],[61,"Chicken Tikka Sandwich",140],
      [62,"Chicken Cutlet Sandwich",140],[63,"Chicken Shawarma Sandwich",140],[64,"Chicken Fila Cheese Sandwich",160],
      [65,"Chicken Tandoori Cheese Sandwich",160],[66,"Chicken Shish Taouk Cheese Sandwich",160],[67,"Chicken Russian Salad Sandwich",140]]],
    ["Veg", "v", [
      [68,"Veg Grilled Sandwich",90],[69,"Veg Club Sandwich",130],[70,"Mushroom Mania Sandwich",100],
      [71,"Corn Cheese Grilled Sandwich",110],[72,"Paneer Cheese Grilled Sandwich",130],[73,"Plain Cheese Sandwich",100],
      [74,"Bombay Toast",80],[75,"Veg Russian Salad Sandwich",90],[76,"Veg Cutlet Sandwich",120],[77,"Grilled Cheese Sandwich",110]]]], ["cheese", "garlic-s", "garlic", "mayo-s", "mayo", "spicy", "fries", "pp-fries", "hummus"]],
  ["Pizza", "Tandoori, tikka, shawarma & cheese", [
    ["Non-veg", "n", [
      [84,"Chicken Cheese Pizza",150],[85,"Chicken Shawarma Pizza",210],[86,"Tandoori Chicken Pizza",240],
      [87,"Chicken Tikka Pizza",230],[88,"Classic Chicken Pizza",220]]],
    ["Veg", "v", [
      [89,"Veg Pizza",130],[90,"Sweetcorn Pizza",170],[91,"Paneer Cheese Pizza",190],[92,"Cheese Pizza",170],
      [93,"Veg Special Pizza",160],[94,"Mushroom Cheese Pizza",170]]]], ["cheese", "garlic-s", "garlic", "spicy"]],
  ["Chinese", "Fried rice, hakka noodles & dry starters", [
    ["Non-veg", "n", [
      [102,"Chicken Fried Rice",130],[103,"Chicken Schezwan Fried Rice",150],[104,"Chicken Hakka Noodles",130],
      [105,"Chicken Schezwan Hakka Noodles",150],[106,"Chicken 65",250],[107,"Chicken Chilly Dry",250]]],
    ["Veg", "v", [
      [108,"Veg Fried Rice",120],[109,"Veg Schezwan Rice",140],[110,"Veg Paneer Rice",170],[111,"Veg Paneer Schezwan Rice",190],
      [112,"Veg Hakka Noodles",120],[113,"Veg Schezwan Hakka Noodles",140],[114,"Veg Paneer Hakka Noodles",170],
      [115,"Veg Paneer Schezwan Hakka Noodles",190]]]], ["spicy"]],
],
snacks: [
  ["All Day Breakfast", "Eggs, kheema & toast, any time", [
    [null, null, [
      [78,"Egg Bhurji",140,"e"],[79,"Egg Masala Omelette",120,"e"],[80,"Chicken Kheema",180,"n"],
      [81,"French Toast",100,"e"],[82,"Toast Butter Jam",80,"v"],[83,"Toast Butter",60,"v"]]]], ["cheese"]],
  ["French Fries", "Salted, peri peri & schezwan", [
    [null, null, [
      [95,"Salted Fries",100,"v"],[96,"Salted Cheese Fries",120,"v"],[97,"Peri Peri Fries",130,"v"],[98,"Peri Peri Cheese Fries",150,"v"],
      [99,"Schezwan Fries",130,"v"],[100,"Schezwan Cheese Fries",150,"v"],[101,"Crispy Chicken Cheese Fries",200,"n"]]]], ["cheese", "garlic-s", "garlic", "mayo-s", "mayo", "spicy"]],
  ["Cutlets", "Chicken & veg, plain or with cheese", [
    [null, null, [
      [116,"Chicken Cutlet",140,"n"],[117,"Veg Cutlet",110,"v"],[118,"Veg Cheese Cutlet",130,"v"],[119,"Chicken Cheese Cutlet",160,"n"]]]], ["garlic-s", "garlic", "mayo-s", "mayo", "spicy", "cheese", "pita", "hummus"]],
],
drinks: [
  ["Cold Drinks", "Fresh lime, sodas & water", [
    [null, "v", [
      [120,"Fresh Lime Water",50],[121,"Fresh Lime Soda",70],[122,"Cold Drinks 500 ml",50],[123,"Cold Drinks 200 ml",20],
      [124,"Mineral Water (1 L)",20],[125,"Cold Drinks",100],[126,"Cold Drinks",150],[127,"Cold Drinks",40],[128,"Cold Drinks",60]]]], []],
  ["Milk Shakes", "Cold coffee & chocolate, with or without ice cream", [
    [null, "v", [
      [129,"Cold Coffee",100],[130,"Cold Coffee With Vanilla Ice Cream",120],[131,"Cold Coffee With Chocolate Ice Cream",130],
      [132,"Chocolate Milk Shake",100],[133,"Chocolate Milk Shake With Vanilla Ice Cream",120],
      [134,"Chocolate Milk Shake With Chocolate Ice Cream",130]]]], []],
  ["Hot Drinks", "Coffee, hot chocolate & milk", [
    [null, "v", [
      [135,"Hot Chocolate",80],[136,"Hot Coffee",70],[137,"Hot Glass of Milk",50]]]], []],
],
};
// Add-ons customers can add to a dish (they used to be the "Extras" section, menu numbers 138–147).
// Each section above lists the ids it offers, as its 4th field; drinks offer none. A dish can override its section
// with an optional 5th field on the item: [no, name, price, diet, ["cheese", "spicy"]].
const ADDONS = {
  "garlic-s": ["Extra Garlic Sauce (Small)", 20],
  "garlic":   ["Extra Garlic Sauce", 50],
  "mayo-s":   ["Extra Mayonnaise (Small)", 20],
  "mayo":     ["Extra Mayonnaise", 50],
  "spicy":    ["Extra Spicy Sauce", 20],
  "cheese":   ["Extra Cheese", 20],
  "salad":    ["Extra Salad", 20],
  "pita":     ["Extra Pita Bread", 20],
  "hummus":   ["Extra Hummus", 20],
  "fries":    ["Extra Fries", 60],
  "pp-fries": ["Extra Peri Peri Fries", 80],
};

// A short description under each dish, by menu number. Drinks have none yet.
const DESCRIPTIONS = {
  1: "Chicken shawarma, garlic sauce, pickles in pita.",
  2: "Classic shawarma with melted cheese.",
  3: "Shawarma chicken with creamy hummus.",
  4: "Shawarma chicken, falafel and hummus.",
  5: "Our shawarma roll, bigger and loaded.",
  6: "Shawarma chicken and garlic sauce, no veggies.",
  7: "Spiced chicken in a crisp, flaky wrap.",
  8: "Extra fila chicken and sauce, no greens.",
  9: "Fila chicken with melted cheese.",
  10: "Fila chicken with egg and cheese.",
  11: "Fiery angara chicken with mint chutney.",
  12: "Spicy angara chicken with cheese.",
  13: "Angara chicken with egg and cheese.",
  14: "Chicken tikka with onions and mint mayo.",
  15: "Chicken tikka with melted cheese.",
  16: "Chicken tikka with egg and cheese.",
  17: "Garlic-lemon chicken with toum and pickles.",
  18: "Shish taouk chicken with cheese.",
  19: "Shish taouk with egg and cheese.",
  20: "Spiced paneer, onions and salad.",
  21: "Extra paneer and sauce, no greens.",
  22: "Spiced paneer with melted cheese.",
  23: "Sautéed mixed veggies and sauces.",
  24: "Mixed veggies with melted cheese.",
  25: "Falafel, tahini and pickles in pita.",
  26: "Crunchy falafel with melted cheese.",
  27: "Spiced veggies, Lebanese-masala style.",
  28: "Lebanese masala with melted cheese.",
  29: "Crispy veg cutlet with chutneys.",
  30: "Veg cutlet with melted cheese.",
  31: "Hummus and garlic sauce, light and simple.",
  32: "Hummus garlic with melted cheese.",
  33: "Hummus with olive oil and 2 pitas.",
  34: "4 falafels, hummus and 2 pitas.",
  35: "Hummus topped with falafel.",
  36: "Shawarma, garlic sauce and pita, no greens.",
  37: "Shawarma with salad, garlic sauce and pita.",
  38: "Shawarma, falafel, hummus and pita.",
  39: "Our biggest platter, all the sides.",
  40: "Chicken patty, lettuce and mayo.",
  41: "Chicken burger with cheese.",
  42: "Chicken patty, fried egg and cheese.",
  43: "Chicken patty with fries inside.",
  44: "Chicken, fries and cheese.",
  45: "Fried chicken fillet, mayo and lettuce.",
  46: "Crispy chicken with cheese.",
  47: "Crispy chicken, egg and cheese.",
  48: "Chicken tikka, mint mayo and onions.",
  49: "Chicken tikka with cheese.",
  50: "Loaded egg and cheese chicken burger.",
  51: "Veg patty, lettuce, tomato and mayo.",
  52: "Veg burger with cheese.",
  53: "Veg patty with fries inside.",
  54: "Veg patty, fries and cheese.",
  55: "Crispy paneer patty and veggies.",
  56: "Paneer burger with extra cheese.",
  57: "Tandoori paneer tikka, mint mayo.",
  58: "Paneer tikka with cheese.",
  59: "Chicken and cheese, grilled crisp.",
  60: "Triple-decker: chicken, egg, veggies.",
  61: "Chicken tikka and mint mayo, toasted.",
  62: "Chicken cutlet, chutney and veggies.",
  63: "Shawarma chicken, grilled in bread.",
  64: "Fila chicken and cheese, toasted.",
  65: "Tandoori chicken and cheese, grilled.",
  66: "Shish taouk chicken and cheese.",
  67: "Creamy chicken Russian salad.",
  68: "Bombay-style veggies and green chutney.",
  69: "Triple-layered veggies and cheese.",
  70: "Mushrooms, herbs and cheese.",
  71: "Sweet corn and cheese, grilled.",
  72: "Spiced paneer and cheese, grilled.",
  73: "Melted cheese in toasted bread.",
  74: "Mumbai-style butter toast with chutney.",
  75: "Creamy mayo veggie salad.",
  76: "Veg cutlet and chutneys, toasted.",
  77: "Extra cheesy, crisp outside.",
  78: "Spicy scrambled eggs with toast.",
  79: "Omelette with onions and chillies.",
  80: "Spiced chicken mince with bread.",
  81: "Egg-dipped bread, pan-fried.",
  82: "Toast with butter and jam.",
  83: "Warm buttered toast.",
  84: "Chicken and mozzarella.",
  85: "Shawarma chicken and garlic sauce.",
  86: "Tandoori chicken, onions, capsicum.",
  87: "Spiced chicken tikka and cheese.",
  88: "Chicken, veggies and mozzarella.",
  89: "Onion, capsicum and tomato.",
  90: "Sweet corn and mozzarella.",
  91: "Spiced paneer, extra cheese.",
  92: "Classic, loaded with mozzarella.",
  93: "Mixed veggies and cheese.",
  94: "Mushrooms and melted cheese.",
  95: "Crispy fries, lightly salted.",
  96: "Fries with cheese sauce.",
  97: "Fries in spicy peri peri.",
  98: "Peri peri fries with cheese.",
  99: "Fries in fiery schezwan sauce.",
  100: "Schezwan fries with cheese.",
  101: "Fries, crispy chicken, cheese sauce.",
  102: "Rice with chicken, egg and veggies.",
  103: "Spicy schezwan rice with chicken.",
  104: "Noodles with chicken and veggies.",
  105: "Schezwan noodles with chicken.",
  106: "Spicy fried chicken, curry leaves.",
  107: "Crispy chicken, chillies and soy.",
  108: "Rice with fresh veggies.",
  109: "Spicy schezwan rice with veggies.",
  110: "Veg fried rice with paneer.",
  111: "Schezwan rice with paneer.",
  112: "Noodles with crunchy veggies.",
  113: "Noodles in spicy schezwan sauce.",
  114: "Noodles with paneer and veggies.",
  115: "Schezwan noodles with paneer.",
  116: "Crumbed, fried chicken mince patty.",
  117: "Crispy potato and veggie patty.",
  118: "Veg cutlet, cheesy centre.",
  119: "Chicken cutlet, cheesy centre.",
};

// Dish photos, by menu number: shown across the top of the dish, and full size when tapped. Files live in img/.
const PHOTOS = {
  1: "img/dish-1.jpg",       // Chicken Shawarma Roll (₹120)
  37: "img/dish-37.jpg",     // Chicken Shawarma Plate With Salad
  38: "img/dish-38.jpg",     // Falafel Chicken Plate
  41: "img/dish-41.jpg",     // Chicken Cheese Burger
  45: "img/dish-45.jpg",     // Chicken Crispy Burger
  56: "img/dish-56.jpg",     // Paneer Cheese Burger
  59: "img/dish-59.jpg",     // Chicken Cheese Grilled Sandwich
  60: "img/dish-60.jpg",     // Non Veg Club Sandwich
  63: "img/dish-63.jpg",     // Chicken Shawarma Sandwich
  77: "img/dish-77.jpg",     // Grilled Cheese Sandwich
  84: "img/dish-84-2.jpg",   // Chicken Cheese Pizza (new photo; a new name so phones don't show the old cached one)
  95: "img/dish-95.jpg",     // Salted Fries
  97: "img/dish-97.jpg",     // Peri Peri Fries
  103: "img/dish-103.jpg",   // Chicken Schezwan Fried Rice
  104: "img/dish-104.jpg",   // Chicken Hakka Noodles
  106: "img/dish-106.jpg",   // Chicken 65
  116: "img/dish-116.jpg",   // Chicken Cutlet
  119: "img/dish-119.jpg",   // Chicken Cheese Cutlet
  121: "img/dish-121.jpg",   // Fresh Lime Soda
  136: "img/dish-136.jpg",   // Hot Coffee
};
