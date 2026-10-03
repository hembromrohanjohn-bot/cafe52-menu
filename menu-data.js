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
      [31,"Hummus Garlic Roll",110],[32,"Hummus Garlic Roll With Cheese",130]]]], ["garlic-s", "garlic", "mayo-s", "mayo", "spicy", "cheese", "salad", "fries", "pp-fries"]],
  ["Plates", "Hummus, falafel & shawarma with pita", [
    ["Veg", "v", [
      [33,"Hummus Plate With 2 Pita Bread",200],[34,"Falafel Plate (4 + 2 Pita Bread) & Hummus",290],[35,"Hummus Falafel Plate",250]]],
    ["Chicken Shawarma", "n", [
      [36,"Chicken Shawarma Plate Without Salad",170],[37,"Chicken Shawarma Plate With Salad",200],
      [38,"Falafel Chicken Plate",320],[39,"Shahan Shawarma Plate",320]]]], ["pita", "garlic-s", "garlic", "mayo-s", "mayo", "spicy", "salad", "fries", "pp-fries"]],
  ["Burgers", "Crispy, tikka & fries burgers", [
    ["Chicken", "n", [
      [40,"Chicken Burger",100],[41,"Chicken Cheese Burger",120],[42,"Chicken Burger With Egg & Cheese",150],
      [43,"Chicken Fries Burger",150],[44,"Chicken Fries Cheese Burger",170],[45,"Chicken Crispy Burger",150],
      [46,"Chicken Crispy Cheese Burger",170],[47,"Chicken Crispy Burger With Egg & Cheese",190],[48,"Chicken Tikka Burger",150],
      [49,"Chicken Tikka Cheese Burger",170],[50,"Chicken Burger With Egg & Cheese",190]]],
    ["Veg", "v", [
      [51,"Veg Burger",90],[52,"Veg Cheese Burger",110],[53,"Veg Fries Burger",130],[54,"Veg Fries Cheese Burger",150],
      [55,"Paneer Burger",140],[56,"Paneer Cheese Burger",160],[57,"Paneer Tikka Burger",160],[58,"Paneer Tikka Cheese Burger",180]]]], ["cheese", "garlic-s", "garlic", "mayo-s", "mayo", "spicy", "salad", "fries", "pp-fries"]],
  ["Sandwiches", "Grilled, club & Bombay toast", [
    ["Non-veg", "n", [
      [59,"Chicken Cheese Grilled Sandwich",110],[60,"Non Veg Club Sandwich",150],[61,"Chicken Tikka Sandwich",140],
      [62,"Chicken Cutlet Sandwich",140],[63,"Chicken Shawarma Sandwich",140],[64,"Chicken Fila Cheese Sandwich",160],
      [65,"Chicken Tandoori Cheese Sandwich",160],[66,"Chicken Shish Taouk Cheese Sandwich",160],[67,"Chicken Russian Salad Sandwich",140]]],
    ["Veg", "v", [
      [68,"Veg Grilled Sandwich",90],[69,"Veg Club Sandwich",130],[70,"Mushroom Mania Sandwich",100],
      [71,"Corn Cheese Grilled Sandwich",110],[72,"Paneer Cheese Grilled Sandwich",130],[73,"Plain Cheese Sandwich",100],
      [74,"Bombay Toast",80],[75,"Veg Russian Salad Sandwich",90],[76,"Veg Cutlet Sandwich",120],[77,"Grilled Cheese Sandwich",110]]]], ["cheese", "garlic-s", "garlic", "mayo-s", "mayo", "spicy", "fries", "pp-fries"]],
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
      [116,"Chicken Cutlet",140,"n"],[117,"Veg Cutlet",110,"v"],[118,"Veg Cheese Cutlet",130,"v"],[119,"Chicken Cheese Cutlet",160,"n"]]]], ["garlic-s", "garlic", "mayo-s", "mayo", "spicy", "cheese", "pita"]],
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
  "fries":    ["Extra Fries", 60],
  "pp-fries": ["Extra Peri Peri Fries", 80],
};

// A short description under each dish, by menu number. Drinks have none yet.
const DESCRIPTIONS = {
  1: "Juicy spit-roasted chicken shawarma with garlic sauce, pickles and fresh salad, wrapped in soft pita.",
  2: "Our classic shawarma roll with a generous layer of melted cheese.",
  3: "Shawarma chicken wrapped with creamy hummus for a smooth Lebanese-style bite.",
  4: "Shawarma chicken and crispy falafel with hummus, all in one hearty wrap.",
  5: "A bigger, fully loaded version of our signature shawarma roll.",
  6: "Packed with shawarma chicken and garlic sauce, with no veggies.",
  7: "Tender spiced chicken in a crisp, flaky wrap with sauces and salad.",
  8: "Extra fila chicken and sauce, no greens.",
  9: "Fila chicken roll loaded with gooey melted cheese.",
  10: "Fila chicken with a layer of egg and melted cheese.",
  11: "Smoky, fiery chicken in bold angara spices, wrapped with onions and mint chutney.",
  12: "Spicy angara chicken balanced with melted cheese.",
  13: "Fiery angara chicken with egg and cheese for a filling wrap.",
  14: "Tandoor-style chicken tikka with onions and mint mayo in a soft wrap.",
  15: "Chicken tikka roll topped with melted cheese.",
  16: "Chicken tikka with egg and cheese, rolled up hot.",
  17: "Lebanese garlic-and-lemon marinated chicken with garlic toum and pickles.",
  18: "Zesty shish taouk chicken with melted cheese.",
  19: "Shish taouk chicken with egg and cheese for extra richness.",
  20: "Spiced paneer cubes with onions, salad and tangy sauces in a soft wrap.",
  21: "Extra paneer and sauce, no greens.",
  22: "Spiced paneer roll loaded with melted cheese.",
  23: "Sautéed mixed vegetables with sauces in a warm wrap.",
  24: "Mixed veggie roll with gooey cheese.",
  25: "Crispy chickpea falafel with tahini, pickles and salad in pita.",
  26: "Crunchy falafel wrap with melted cheese.",
  27: "Lebanese flavours meet Indian masala in a spiced veggie wrap.",
  28: "Lebanese masala roll with melted cheese.",
  29: "Crispy veg cutlet with chutneys and onions in a soft roll.",
  30: "Veg cutlet roll with melted cheese.",
  31: "Creamy hummus and garlic sauce in a light, simple wrap.",
  32: "Hummus garlic roll with melted cheese.",
  33: "Smooth chickpea hummus with olive oil, served with two warm pitas.",
  34: "Four crispy falafels with hummus and two pitas.",
  35: "Creamy hummus topped with crunchy falafel, ready to share.",
  36: "Shawarma chicken with garlic sauce and pita, no greens.",
  37: "Shawarma chicken served with fresh salad, garlic sauce and pita.",
  38: "Shawarma chicken and falafel on one plate with hummus and pita.",
  39: "Our biggest shawarma platter, loaded with chicken and all the sides.",
  40: "Golden chicken patty with lettuce and mayo in a soft bun.",
  41: "Chicken burger with a melted cheese slice.",
  42: "Chicken patty stacked with fried egg and cheese.",
  43: "Chicken patty with crispy fries inside the bun.",
  44: "Chicken, fries and melted cheese in one bun.",
  45: "Crunchy fried chicken fillet with mayo and lettuce.",
  46: "Crispy chicken burger with melted cheese.",
  47: "Crispy chicken stacked with egg and cheese.",
  48: "Smoky chicken tikka with mint mayo and onions in a bun.",
  49: "Chicken tikka burger with melted cheese.",
  50: "A loaded version of our egg and cheese chicken burger.",
  51: "Crispy veg patty with lettuce, tomato and mayo.",
  52: "Veg burger with a melted cheese slice.",
  53: "Veg patty with crispy fries in the bun.",
  54: "Veg patty, fries and melted cheese together.",
  55: "Crispy paneer patty with fresh veggies and sauce.",
  56: "Paneer burger with extra melted cheese.",
  57: "Smoky tandoori paneer tikka with mint mayo.",
  58: "Paneer tikka burger with melted cheese.",
  59: "Chicken and cheese grilled golden and crisp.",
  60: "Triple-decker of chicken, egg, veggies and sauces.",
  61: "Smoky chicken tikka with mint mayo in toasted bread.",
  62: "Crispy chicken cutlet with chutney and veggies.",
  63: "Shawarma chicken and garlic sauce, grilled in bread.",
  64: "Fila chicken and melted cheese, toasted crisp.",
  65: "Tandoori chicken with cheese, grilled hot.",
  66: "Garlic-lemon shish taouk chicken with cheese, toasted.",
  67: "Creamy chicken and veggie Russian salad in soft bread.",
  68: "Classic Bombay-style veggies with green chutney, grilled crisp.",
  69: "Triple-layered veggies, cheese and sauces.",
  70: "Sautéed mushrooms with herbs and cheese, toasted.",
  71: "Sweet corn and melted cheese, grilled golden.",
  72: "Spiced paneer and cheese, grilled crisp.",
  73: "Simple, comforting melted cheese between toasted bread.",
  74: "Mumbai street-style buttered toast with chutney and veggies.",
  75: "Creamy mayo veggie salad in soft bread.",
  76: "Crispy veg cutlet with chutneys, toasted.",
  77: "Extra cheesy and crisp on the outside.",
  78: "Spicy Indian scrambled eggs with onion, tomato and chilli, served with toast.",
  79: "Fluffy omelette with onions, chillies and masala.",
  80: "Spiced minced chicken cooked masala-style, served with bread.",
  81: "Egg-dipped bread, pan-fried golden.",
  82: "Crisp toast with butter and sweet jam.",
  83: "Warm toast with a generous layer of butter.",
  84: "Chicken and mozzarella on a tomato base.",
  85: "Shawarma chicken and garlic sauce on a cheesy pizza.",
  86: "Smoky tandoori chicken with onions and capsicum.",
  87: "Spiced chicken tikka on a cheesy base.",
  88: "Chicken, veggies and plenty of mozzarella.",
  89: "Fresh onions, capsicum and tomato on a cheesy base.",
  90: "Sweet corn with melted mozzarella.",
  91: "Spiced paneer cubes with extra cheese.",
  92: "Classic margherita-style, loaded with mozzarella.",
  93: "Loaded with mixed veggies and cheese.",
  94: "Sautéed mushrooms and melted cheese.",
  95: "Crispy golden fries, lightly salted.",
  96: "Salted fries topped with cheese sauce.",
  97: "Fries tossed in tangy, spicy peri peri.",
  98: "Peri peri fries with melted cheese.",
  99: "Fries tossed in fiery Indo-Chinese schezwan sauce.",
  100: "Schezwan fries with cheese.",
  101: "Fries loaded with crispy chicken and cheese sauce.",
  102: "Wok-tossed rice with chicken, egg and veggies.",
  103: "Spicy schezwan fried rice with chicken.",
  104: "Stir-fried noodles with chicken and crunchy veggies.",
  105: "Hakka noodles with chicken in fiery schezwan sauce.",
  106: "Spicy, crispy deep-fried chicken bites with curry leaves.",
  107: "Crispy chicken tossed with chillies, capsicum and soy.",
  108: "Wok-tossed rice with fresh veggies.",
  109: "Spicy schezwan fried rice with veggies.",
  110: "Veg fried rice with soft paneer cubes.",
  111: "Fiery schezwan rice with paneer and veggies.",
  112: "Stir-fried noodles with crunchy veggies.",
  113: "Hakka noodles in spicy schezwan sauce.",
  114: "Hakka noodles with paneer and veggies.",
  115: "Spicy schezwan noodles with paneer.",
  116: "Spiced minced chicken patty, crumbed and fried crisp.",
  117: "Crispy spiced potato and veggie patty.",
  118: "Veg cutlet with a melty cheese centre.",
  119: "Chicken cutlet with a melty cheese centre.",
};

// Dish photos, by menu number: shown across the top of the dish, and full size when tapped. Files live in img/.
const PHOTOS = {
  84: "img/dish-84.jpg",   // Chicken Cheese Pizza
};
