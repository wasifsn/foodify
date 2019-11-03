import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/SearchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";

import { elements, renderLoader, clearLoader } from "./views/base";
/**Global state of the App
    * - search object
    * - Current Recipe object
    * - shopping recipes object
    * - liked recipes object

*/
const state = {};

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
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
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

/**
 * LIKE CONTROLLER
 */
//TESTING

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const CurrentID = state.recipe.id;

  //user has NOT liked the recipe yet
  if (!state.likes.isLiked(CurrentID)) {
    //Add like to the state
    const newLike = state.likes.addLike(
      CurrentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    window.n = newLike;
    //toggle the like button

    likesView.toggleLikeBtn(true);
    // add like to the ui list

    // console.log(state.likes);
    likesView.renderLike(newLike);

    //user has LIKED the recipe
  } else {
    //Remove like to the state
    state.likes.deleteLike(CurrentID);

    //toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like to the ui list
    likesView.deleteLike(CurrentID);
  }

  likesView.toggleMenu(state.likes.getNumLikes());
};
//Restore the liked recipe on page load
window.addEventListener("load", () => {
  state.likes = new Likes();

  //Restore likes
  state.likes.readStorage();

  //toggle like menu button
  likesView.toggleMenu(state.likes.getNumLikes());

  // Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
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
    // Add Ingredients to shopping List
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // Like controller
    controlLike();
  }
});
