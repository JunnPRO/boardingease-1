import { listings } from "./data.js";

const SCHOOL_DAYS_PER_MONTH = 22;

export const state = {
  listings: listings,
  filtered: listings,
  searchTerm: "",
  maxRent: "",
  selectedId: null,
  occupants: 1,
  includeTransport: false,
};

export const applyFilters = () => {
  const query = state.searchTerm.toLowerCase().trim();
  const maxRent = state.maxRent;

  state.filtered = state.listings.filter((listing) => {
    const matchesQuery =
      query === "" ||
      listing.name.toLowerCase().includes(query) ||
      listing.barangay.toLowerCase().includes(query);

    const matchesRent =
      maxRent === "" || listing.monthlyRent <= Number(maxRent);

    return matchesQuery && matchesRent;
  });
};

export const setSearchTerm = (term) => {
  state.searchTerm = term;
  applyFilters();
};

export const setMaxRent = (value) => {
  state.maxRent = value;
  applyFilters();
};

export const getSelectedListing = () =>
  state.listings.find((l) => l.id === state.selectedId);

export const setSelected = (id) => {
  state.selectedId = id;
  const listing = getSelectedListing();
  if (listing) state.occupants = listing.maxOccupants;
};

export const setOccupants = (n) => {
  state.occupants = n;
};

export const setTransport = (on) => {
  state.includeTransport = on;
};

const sumUtilities = ({ electricity = 0, water = 0, internet = 0 }) =>
  electricity + water + internet;

export const calculateCostPerHead = (listing, people, withTransport) => {
  if (!Number.isInteger(people) || people < 1)
    throw new Error("Number of occupants must be a whole number, at least 1.");
  if (people > listing.maxOccupants)
    throw new Error(
      `This listing allows at most ${listing.maxOccupants} occupants`,
    );

  const rentPerHead = listing.monthlyRent / people;

  const utilitiesPerHead = listing.utilitiesIncluded
    ? 0
    : sumUtilities(listing.estimatedUtilities) / people;

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