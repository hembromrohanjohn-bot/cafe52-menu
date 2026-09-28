// Café 52 menu: every dish, price and diet mark. Used by the menu (index.html) and the staff screen (staff.html).
/* ---------- menu data ----------
   Tab → sections: [title, blurb, groups]
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
      [31,"Hummus Garlic Roll",110],[32,"Hummus Garlic Roll With Cheese",130]]]]],
  ["Plates", "Hummus, falafel & shawarma with pita", [
    ["Veg", "v", [
      [33,"Hummus Plate With 2 Pita Bread",200],[34,"Falafel Plate (4 + 2 Pita Bread) & Hummus",290],[35,"Hummus Falafel Plate",250]]],
    ["Chicken Shawarma", "n", [
      [36,"Chicken Shawarma Plate Without Salad",170],[37,"Chicken Shawarma Plate With Salad",200],
      [38,"Falafel Chicken Plate",320],[39,"Shahan Shawarma Plate",320]]]]],
  ["Burgers", "Crispy, tikka & fries burgers", [
    ["Chicken", "n", [
      [40,"Chicken Burger",100],[41,"Chicken Cheese Burger",120],[42,"Chicken Burger With Egg & Cheese",150],
      [43,"Chicken Fries Burger",150],[44,"Chicken Fries Cheese Burger",170],[45,"Chicken Crispy Burger",150],
      [46,"Chicken Crispy Cheese Burger",170],[47,"Chicken Crispy Burger With Egg & Cheese",190],[48,"Chicken Tikka Burger",150],
      [49,"Chicken Tikka Cheese Burger",170],[50,"Chicken Burger With Egg & Cheese",190]]],
    ["Veg", "v", [
      [51,"Veg Burger",90],[52,"Veg Cheese Burger",110],[53,"Veg Fries Burger",130],[54,"Veg Fries Cheese Burger",150],
      [55,"Paneer Burger",140],[56,"Paneer Cheese Burger",160],[57,"Paneer Tikka Burger",160],[58,"Paneer Tikka Cheese Burger",180]]]]],
  ["Sandwiches", "Grilled, club & Bombay toast", [
    ["Non-veg", "n", [
      [59,"Chicken Cheese Grilled Sandwich",110],[60,"Non Veg Club Sandwich",150],[61,"Chicken Tikka Sandwich",140],
      [62,"Chicken Cutlet Sandwich",140],[63,"Chicken Shawarma Sandwich",140],[64,"Chicken Fila Cheese Sandwich",160],
      [65,"Chicken Tandoori Cheese Sandwich",160],[66,"Chicken Shish Taouk Cheese Sandwich",160],[67,"Chicken Russian Salad Sandwich",140]]],
    ["Veg", "v", [
      [68,"Veg Grilled Sandwich",90],[69,"Veg Club Sandwich",130],[70,"Mushroom Mania Sandwich",100],
      [71,"Corn Cheese Grilled Sandwich",110],[72,"Paneer Cheese Grilled Sandwich",130],[73,"Plain Cheese Sandwich",100],
      [74,"Bombay Toast",80],[75,"Veg Russian Salad Sandwich",90],[76,"Veg Cutlet Sandwich",120],[77,"Grilled Cheese Sandwich",110]]]]],
  ["Pizza", "Tandoori, tikka, shawarma & cheese", [
    ["Non-veg", "n", [
      [84,"Chicken Cheese Pizza",150],[85,"Chicken Shawarma Pizza",210],[86,"Tandoori Chicken Pizza",240],
      [87,"Chicken Tikka Pizza",230],[88,"Classic Chicken Pizza",220]]],
    ["Veg", "v", [
      [89,"Veg Pizza",130],[90,"Sweetcorn Pizza",170],[91,"Paneer Cheese Pizza",190],[92,"Cheese Pizza",170],
      [93,"Veg Special Pizza",160],[94,"Mushroom Cheese Pizza",170]]]]],
  ["Chinese", "Fried rice, hakka noodles & dry starters", [
    ["Non-veg", "n", [
      [102,"Chicken Fried Rice",130],[103,"Chicken Schezwan Fried Rice",150],[104,"Chicken Hakka Noodles",130],
      [105,"Chicken Schezwan Hakka Noodles",150],[106,"Chicken 65",250],[107,"Chicken Chilly Dry",250]]],
    ["Veg", "v", [
      [108,"Veg Fried Rice",120],[109,"Veg Schezwan Rice",140],[110,"Veg Paneer Rice",170],[111,"Veg Paneer Schezwan Rice",190],
      [112,"Veg Hakka Noodles",120],[113,"Veg Schezwan Hakka Noodles",140],[114,"Veg Paneer Hakka Noodles",170],
      [115,"Veg Paneer Schezwan Hakka Noodles",190]]]]],
],
snacks: [
  ["All Day Breakfast", "Eggs, kheema & toast, any time", [
    [null, null, [
      [78,"Egg Bhurji",140,"e"],[79,"Egg Masala Omelette",120,"e"],[80,"Chicken Kheema",180,"n"],
      [81,"French Toast",100,"e"],[82,"Toast Butter Jam",80,"v"],[83,"Toast Butter",60,"v"]]]]],
  ["French Fries", "Salted, peri peri & schezwan", [
    [null, null, [
      [95,"Salted Fries",100,"v"],[96,"Salted Cheese Fries",120,"v"],[97,"Peri Peri Fries",130,"v"],[98,"Peri Peri Cheese Fries",150,"v"],
      [99,"Schezwan Fries",130,"v"],[100,"Schezwan Cheese Fries",150,"v"],[101,"Crispy Chicken Cheese Fries",200,"n"]]]]],
  ["Cutlets", "Chicken & veg, plain or with cheese", [
    [null, null, [
      [116,"Chicken Cutlet",140,"n"],[117,"Veg Cutlet",110,"v"],[118,"Veg Cheese Cutlet",130,"v"],[119,"Chicken Cheese Cutlet",160,"n"]]]]],
],
drinks: [
  ["Cold Drinks", "Fresh lime, sodas & water", [
    [null, "v", [
      [120,"Fresh Lime Water",50],[121,"Fresh Lime Soda",70],[122,"Cold Drinks 500 ml",50],[123,"Cold Drinks 200 ml",20],
      [124,"Mineral Water (1 L)",20],[125,"Cold Drinks",100],[126,"Cold Drinks",150],[127,"Cold Drinks",40],[128,"Cold Drinks",60]]]]],
  ["Milk Shakes", "Cold coffee & chocolate, with or without ice cream", [
    [null, "v", [
      [129,"Cold Coffee",100],[130,"Cold Coffee With Vanilla Ice Cream",120],[131,"Cold Coffee With Chocolate Ice Cream",130],
      [132,"Chocolate Milk Shake",100],[133,"Chocolate Milk Shake With Vanilla Ice Cream",120],
      [134,"Chocolate Milk Shake With Chocolate Ice Cream",130]]]]],
  ["Hot Drinks", "Coffee, hot chocolate & milk", [
    [null, "v", [
      [135,"Hot Chocolate",80],[136,"Hot Coffee",70],[137,"Hot Glass of Milk",50]]]]],
],
};
// Shown as its own section at the end of the Food tab
const EXTRAS = ["Extras", "Add to any order", [
  [138,"Extra Garlic Sauce",50],[139,"Extra Mayonnaise",50],[140,"Extra Pita Bread",20],[141,"Extra Salad",20],
  [142,"Extra Mayonnaise (Small)",20],[143,"Extra Garlic Sauce (Small)",20],[144,"Extra Spicy Sauce",20],
  [145,"Extra Cheese",20],[146,"Extra Fries",60],[147,"Extra Peri Peri Fries",80]]];
