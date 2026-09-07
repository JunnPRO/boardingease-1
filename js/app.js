import { listings } from "./data.js";

let newListings = listings;
let selectedListing = null;
let occupants = 1;
let includeTransport = true;

const SCHOOL_DAYS_PER_MONTH = 22;

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
const searchCount = document.querySelector(".search__count");
const fieldInput = document.querySelector(".field__input");
const maxRentInput = document.querySelector("#max-rent");
const searchForm = document.querySelector("#search-form");

/* ---------------------------------------------------------------
   COST CALCULATION
   Formula:
   rent      = monthlyRent ÷ occupants
   utilities = 0 if utilitiesIncluded
               else (electricity + water + internet) ÷ occupants
   transport = fareOneWay × 2 × 22
   total     = rent + utilities + transport
   --------------------------------------------------------------- */

const sumUtilities = ({ electricity = 0, water = 0, internet = 0 } = {}) =>
  electricity + water + internet;

const calculateCostPerHead = (listing, people, withTransport) => {
  if (!Number.isInteger(people) || people < 1) {
    throw new Error("Number of occupants must be a whole number, at least 1.");
  }

  if (people > listing.maxOccupants) {
    throw new Error(
      `This listing allows at most ${listing.maxOccupants} occupants.`,
    );
  }

  const rentPerHead = listing.monthlyRent / people;

  const utilitiesPerHead = listing.utilitiesIncluded
    ? 0
    : sumUtilities(listing.estimatedUtilities) / people;

  // Transport does NOT divide. Sharing a room does not make the jeepney
  // cheaper -- everyone pays their own fare, both ways, every school day.
  const transportPerHead = withTransport
    ? listing.fareOneWay * 2 * SCHOOL_DAYS_PER_MONTH
    : 0;

  return {
    rentPerHead,
    utilitiesPerHead,
    transportPerHead,
    totalPerHead: rentPerHead + utilitiesPerHead + transportPerHead,
  };
};

/* ---------------------------------------------------------------
   MARKUP GENERATION
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
    ? `<span class="tag">Utilities included</span>`
    : `<span class="tag tag--utilities">Utilities extra</span>`;

  return `<li>
              <button
                class="card"
                type="button"
                data-id="${id}"
                aria-pressed="${selectedListing && id === selectedListing.id}"
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
                  <span class="card__rent">${peso.format(monthlyRent)} / month</span>
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

const breakdownMarkup = (listing) => {
  try {
    const { rentPerHead, utilitiesPerHead, transportPerHead, totalPerHead } =
      calculateCostPerHead(listing, occupants, includeTransport);

    return `
      <p class="breakdown__line">
        <span>Rent</span><span>${peso.format(rentPerHead)}</span>
      </p>
      <p class="breakdown__line">
        <span>Utilities</span><span>${peso.format(utilitiesPerHead)}</span>
      </p>
      <p class="breakdown__line">
        <span>Transport</span><span>${peso.format(transportPerHead)}</span>
      </p>
      <p class="breakdown__total">
        <span>Per person</span><span>${peso.format(totalPerHead)}</span>
      </p>
    `;
  } catch (err) {
    return `<p class="error">${err.message}</p>`;
  }
};

const detailMarkUpGenerator = (listing) => {
  const { name, barangay, monthlyRent, maxOccupants } = listing;

  return `
    <h2 class="detail__name">${name}</h2>
    <p class="detail__where">${barangay} &middot; ${peso.format(monthlyRent)} / month</p>
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
          ${includeTransport ? "checked" : ""}
        />
      </div>
    </fieldset>

    <div class="breakdown">
      ${breakdownMarkup(listing)}
    </div>        
  `;
};

const renderDetail = () => {
  if (!selectedListing) {
    detailsContainer.innerHTML = `<p class="detail__empty">Select a listing to see the cost breakdown.</p>`;
    return;
  }

  detailsContainer.innerHTML = detailMarkUpGenerator(selectedListing);
};

/* ---------------------------------------------------------------
   EVENT LISTENERS
   --------------------------------------------------------------- */

resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");

  if (!card) return;

  const listingID = card.dataset.id;

  selectedListing = newListings.find((listing) => listingID === listing.id);
  if (!selectedListing) return;

  occupants = selectedListing.maxOccupants;
  includeTransport = true;

  results();
  renderDetail();
});

// Event delegation on detailsContainer:
// The splitter input and checkbox are created dynamically when a card is selected.
// Listening on detailsContainer handles input changes whenever the user adjusts "Sharing with" or daily fare.
detailsContainer.addEventListener("input", (event) => {
  if (event.target.id === "occupants-demo") {
    occupants = Number(event.target.value);
    renderDetail();
  }

  if (event.target.id === "transport-demo") {
    includeTransport = event.target.checked;
    renderDetail();
  }
});

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
   START
   --------------------------------------------------------------- */

applyFilters();
results();
renderDetail();
