class SearchView {
  _searchInput = document.querySelector("#search-input");
  _maxRentInput = document.querySelector("#max-rent");
  _form = document.querySelector("#search-form");
  _countEl = document.querySelector(".search__count");

  addSearchHandler(handler) {
    this._searchInput.addEventListener("input", (e) => {
      handler(e.target.value);
    });
  }

  addMaxRentHandler(handler) {
    this._maxRentInput.addEventListener("input", (e) => {
      handler(e.target.value);
    });
  }

  addFormHandler() {
    this._form.addEventListener("submit", (e) => e.preventDefault());
  }

  renderCount(count) {
    this._countEl.textContent = `${count} listing${count === 1 ? "" : "s"}`;
  }

  addSelectHandler(handler) {
    this._parentElement.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const id = card.dataset.id;
      handler(id);
    });
  }

  markSelected(id) {
    const cards = this._parentElement.querySelectorAll(".card").forEach((card) => {
      card.setAttribute("aria-pressed", string(card.dataset.id === id));
    });
  }
}

export default new SearchView();
