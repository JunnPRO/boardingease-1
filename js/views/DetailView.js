import View from "./View.js";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

class DetailView extends View {
  _parentElement = document.querySelector(".detail");
  _errorMessage = "That listing could not be found.";

  renderError(message = this._errorMessage) {
    this._clear();
    this._parentElement.insertAdjacentHTML(
      "afterbegin",
      `<p class="error">${message}</p>`,
    );
  }

  _generateMarkup = () => {
    const { listing, occupants, includeTransport } = this._data;
    const { name, barangay, monthlyRent, maxOccupants } = listing;

    return `
      <h2 class="detail__name">${name}</h2>
      <p class="detail__where">${barangay} &middot; ${peso.format(monthlyRent)} / month</p>
      <fieldset class="splitter">
        <legend class="splitter__legend">Split the cost</legend>
        <div class="splitter__row">
          <label for="occupants-demo">Sharing with</label>
          <input class="field__input" type="number" id="occupants-demo"
                 min="1" max="${maxOccupants}" value="${occupants}" />
        </div>
        <div class="splitter__row">
          <label for="transport-demo">Include daily fare</label>
          <input type="checkbox" id="transport-demo" ${includeTransport ? "checked" : ""} />
        </div>
      </fieldset>
      <div class="breakdown">${this._generateBreakdownMarkup()}</div>
    `;
  };

  _generateBreakdownMarkup = () => {
    const { costs, error } = this._data;
    if (error) return `<p class="error">${error}</p>`;

    const { rentPerHead, utilitiesPerHead, transportPerHead, totalPerHead } =
      costs;
    return `
      <p class="breakdown__line"><span>Rent</span><span>${peso.format(rentPerHead)}</span></p>
      <p class="breakdown__line"><span>Utilities</span><span>${peso.format(utilitiesPerHead)}</span></p>
      <p class="breakdown__line"><span>Transport</span><span>${peso.format(transportPerHead)}</span></p>
      <p class="breakdown__total"><span>Per person</span><span>${peso.format(totalPerHead)}</span></p>
    `;
  };

  updateBreakdown(data) {
    const breakdown = this._parentElement.querySelector(".breakdown");
    if (!breakdown) return;
    this._data = data;
    breakdown.innerHTML = this._generateBreakdownMarkup();
  }

  addOccupantsHandler(handler) {
    this._parentElement.addEventListener("input", (e) => {
      if (e.target.id !== "occupants-demo") return;
      handler(Number(e.target.value));
    });
  }

  addTransportHandler(handler) {
    this._parentElement.addEventListener("input", (e) => {
      if (e.target.id !== "transport-demo") return;
      handler(e.target.checked);
    });
  }
}

export default new DetailView();