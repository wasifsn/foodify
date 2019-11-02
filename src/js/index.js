// 4579550faafc283d2e681655792b22eb
import axios from "axios";
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from "./views/SearchView";
import * as recipeView from "./views/recipeView";

import { elements, renderLoader, clearLoader } from "./views/base";
/**Global state of the App
    * - search object
    * - Current Recipe object
    * - shopping recipes object
    * - liked recipes object

*/
const state = {
  // search: null
};

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
