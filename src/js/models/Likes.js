export default class Likes {
  constructor() {
    this.likes = [];
  }

  addLike(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);
    //persist data in local storage
    this.persistData();
    return like;
  }

  deleteLike(id) {
    const ind = this.likes.findIndex(el => el.id === id);
    this.likes.splice(ind, 1);

    //persist data in local storage
  }

  isLiked(id) {
    return this.likes.findIndex(el => el.id === id) !== -1;
  }

  getNumLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem("likes", JSON.stringify(this.likes));
  }

  readStorage() {
    const storage = JSON.parse(localStorage.getItem("likes"));
    //Restore the likes from the local storage
    if (storage) this.likes = storage;
  }
}
