import axios from "axios";
import { key, proxy } from "../config";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe(id) {
    try {
      const res = await axios.get(
        `${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.publisher = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.ingredients = res.data.recipe.ingredients;
      this.url = res.data.recipe.source_url;
      console.log(res);
    } catch (err) {
      console.log(err);
      window.alert("something went wrong 😒");
    }
  }

  calcTime() {
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds"
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "tsp",
      "tsp",
      "oz",
      "cup",
      "pound"
    ];
    const units = [...unitsShort, "kg", "gm"];
    const newIngredients = this.ingredients.map(el => {
      //  1. uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, units[i]);
      });
      // 2. Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");
      // 3. parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(" ");

      const unitIndex = arrIng.findIndex(el2 => {
        units.includes(el2);
      });
      let objIng;
      if (unitIndex > -1) {
        //there is a unit
        // Eg; 4 1/2 cups, arrrCount is [4, 1/2]
        // Eg; 4 cups, arrrCount is [4]

        const arrCount = arrIng.slice(0, unitIndex);

        let count;
        if (arrCount.length === 1) {
          count = arrIng[0].replace("-", "+");
        } else {
          count = eval(arrIng.slice(0, unitIndex).join("+"));
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (+arrIng[0]) {
        // there is no unit, but the 1st element is number
        objIng = {
          count: +arrIng[0],
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        };
      } else if (unitIndex === -1) {
        //there is no unit and no num in the 1st position
        objIng = {
          count: 1,
          unit: "",
          ingredient
        };
      }
      return objIng;
    });
    this.ingredients = newIngredients;
  }
}
