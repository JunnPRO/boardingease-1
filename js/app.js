import { listings } from "./data.js";

let newListings = listings;
let currentListing = null;
let currentOccupants = 1;
let includeTransport = true;

const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
const searchCount = document.querySelector(".search__count");
const fieldInput = document.querySelector(".field__input");
const maxRentInput = document.querySelector("#max-rent");
const searchForm = document.querySelector("#search-form");

/* ---------------------------------------------------------------
   MARKUP GENERATORS
   --------------------------------------------------------------- */

const markupGenerator = (listing) => {
  const {
    id,
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    distanceToCampusKm,
  } = listing;

  const utilitiesTag = utilitiesIncluded
    ? `<span class="tag tag--utilities">Utilities included</span>`
    : `<span class="tag tag--utilities">Utilities extra</span>`;

  return `<li>
              <button
                class="card"
                type="button"
                data-id="${id}"
                aria-pressed="${currentListing && id === currentListing.id}"
              >
                <img
                  class="card__image"
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                  src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%23e8f2ee'/><path d='M20 62l18-20 14 16 10-10 14 14v10H20z' fill='%231e7a5f' opacity='.45'/><circle cx='64' cy='32' r='7' fill='%231e7a5f' opacity='.45'/></svg>"
                />
                <span>
                  <span class="card__name">${name}</span>
                  <span class="card__meta"
                    >${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to ${maxOccupants}</span
                  >
                  <span class="card__rent">&#8369;${monthlyRent.toLocaleString()} / month</span>
                  <span class="tags">${utilitiesTag}</span>
                </span>
              </button>
            </li>`;
};

const results = () => {
  searchCount.textContent = `${newListings.length} listing${
    newListings.length === 1 ? "" : "s"
  } found`;

  if (newListings.length === 0) {
    resultsList.innerHTML = `<li class="empty">
              No listings match that search. Try a barangay name.
            </li>`;
    return;
  }

  resultsList.innerHTML = newListings.map(markupGenerator).join("");
};

const detailMarkUpGenerator = (listing, occupants, withTransport) => {
  const {
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    estimatedUtilities,
    fareOneWay,
  } = listing;

  // Formula calculations
  let breakdownContent = "";

  if (occupants > maxOccupants) {
    breakdownContent = `<p class="error">This listing allows at most ${maxOccupants} occupants.</p>`;
  } else if (!occupants || occupants < 1) {
    breakdownContent = `<p class="error">Please enter at least 1 occupant.</p>`;
  } else {
    // rent = monthlyRent ÷ occupants
    const rent = Math.round(monthlyRent / occupants);

    // utilities = 0 if utilitiesIncluded else (electricity + water + internet) ÷ occupants
    const totalUtilities =
      (estimatedUtilities?.electricity || 0) +
      (estimatedUtilities?.water || 0) +
      (estimatedUtilities?.internet || 0);

    const utilities = utilitiesIncluded
      ? 0
      : Math.round(totalUtilities / occupants);

    // transport = fareOneWay × 2 × 22 (round trip × 22 school days)
    const transport = withTransport ? fareOneWay * 2 * 22 : 0;

    // total = rent + utilities + transport
    const total = rent + utilities + transport;

    breakdownContent = `
      <p class="breakdown__line">
        <span>Rent</span><span>&#8369;${rent.toLocaleString()}</span>
      </p>
      <p class="breakdown__line">
        <span>Utilities</span><span>&#8369;${utilities.toLocaleString()}</span>
      </p>
      <p class="breakdown__line">
        <span>Transport</span><span>&#8369;${transport.toLocaleString()}</span>
      </p>
      <p class="breakdown__total">
        <span>Per person</span><span>&#8369;${total.toLocaleString()}</span>
      </p>
    `;
  }

  return `
    <h2 class="detail__name">${name}</h2>
    <p class="detail__where">${barangay} &middot; &#8369;${monthlyRent.toLocaleString()} / month</p>
    <fieldset class="splitter">
      <legend class="splitter__legend">Split the cost</legend>

      <div class="splitter__row">
        <label for="occupants-demo">Sharing with</label>
        <input
          class="field__input"
          type="number"
          id="occupants-demo"
          min="1"
          max="${maxOccupants}"
          value="${occupants}"
        />
      </div>

      <div class="splitter__row">
        <label for="transport-demo">Include daily fare</label>
        <input
          type="checkbox"
          id="transport-demo"
          ${withTransport ? "checked" : ""}
        />
      </div>
    </fieldset>

    <div class="breakdown">
      ${breakdownContent}
    </div>        
  `;
};

/* ---------------------------------------------------------------
   EVENT LISTENERS
   --------------------------------------------------------------- */

// Click on listing card
resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;

  const listingID = card.dataset.id;
  currentListing = newListings.find((listing) => listingID === listing.id);
  if (!currentListing) return;

  // Default to maxOccupants when card is opened
  currentOccupants = currentListing.maxOccupants;
  includeTransport = true;

  results();
  detailsContainer.innerHTML = detailMarkUpGenerator(
    currentListing,
    currentOccupants,
    includeTransport
  );
});

// Event delegation on detailsContainer:
// Listens for input changes on "Sharing with" and "Include daily fare"
detailsContainer.addEventListener("input", (event) => {
  if (!currentListing) return;

  if (event.target.id === "occupants-demo") {
    // .value is a string, cast to Number
    currentOccupants = Number(event.target.value);
    detailsContainer.innerHTML = detailMarkUpGenerator(
      currentListing,
      currentOccupants,
      includeTransport
    );
  }

  if (event.target.id === "transport-demo") {
    includeTransport = event.target.checked;
    detailsContainer.innerHTML = detailMarkUpGenerator(
      currentListing,
      currentOccupants,
      includeTransport
    );
  }
});

/* ---------------------------------------------------------------
   SEARCH & FILTER
   --------------------------------------------------------------- */

const applyFilters = () => {
  const query = fieldInput.value.toLowerCase().trim();
  const maxRent = maxRentInput.value;

  newListings = listings.filter((listing) => {
    const matchesQuery =
      query === "" || listing.name.toLowerCase().includes(query);

    const matchesRent =
      maxRent === "" || listing.monthlyRent <= Number(maxRent);

    return matchesQuery && matchesRent;
  });

  results();
};

fieldInput.addEventListener("input", applyFilters);
maxRentInput.addEventListener("input", applyFilters);

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

/* ---------------------------------------------------------------
   INITIALIZE
   --------------------------------------------------------------- */

applyFilters();
results();
