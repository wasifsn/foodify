// 4579550faafc283d2e681655792b22eb
import axios from "axios";
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/SearchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";

import { elements, renderLoader, clearLoader } from "./views/base";
/**Global state of the App
    * - search object
    * - Current Recipe object
    * - shopping recipes object
    * - liked recipes object

*/
const state = {};
window.state = state;
window.s = state;
/*
 *Controller for Search
 */
const controlSearch = async () => {
  //1) get query from the view
  const query = searchView.getInput();

  // //TESTING
  // const query = "PIZZA";
  console.log(query);
  if (query) {
    // 2) New search object and add to the state
    state.search = new Search(query);

    // 3) prepare UI for the results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      // 4) search for recipes
      await state.search.getResults();
      // 5) render results on the UI
      clearLoader();

      searchView.renderResults(state.search.result);
      console.log(state.search.result);
    } catch (err) {
      console.log(`${err}: is the Error`);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

// TESTING
// window.addEventListener("load", e => {
//   e.preventDefault();
//   controlSearch();
// });

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = +btn.dataset.goto;
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
    console.log(goToPage);
  }
});

/*
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  //get id from the URl
  const id = window.location.hash.replace("#", "");

  if (id) {
    //prepare UI for the Changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //Highlight select
    if (state.search) {
      searchView.highlightSelected(id);
    }

    // Create a new recipe object
    state.recipe = new Recipe(id);
    window.r = state.recipe;
    try {
      //get recipe data and parse ingredients

      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (err) {
      console.log(err);
      console.log("there was an Error Processing the recipe");
    }
  }
};

["hashchange", "load"].forEach(event => {
  window.addEventListener(event, controlRecipe);
});

/**
 * LIST CONTROLLER
 */

const controlList = () => {
  //create new list if there is no List in the state variable
  if (!state.list) state.list = new List();

  // Add each ingredient to the list
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// handle delete and update list
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  //handle delete functionality and remove from state

  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from state
    state.list.deleteItem(id);
    //delete from the UI
    listView.deleteItem(id);
  } else if (
    e.target.matches(".shopping__count--value") &&
    e.target.value >= 0
  ) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});
//Handling recipe button clicks

elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  }
});
