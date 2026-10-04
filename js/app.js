import * as model from "./model.js";
import searchView from "./views/SearchView.js";
import resultsView from "./views/ResultsView.js";
import detailView from "./views/DetailView.js";

const detailData = () => {
  const listing = model.getSelectedListing();
  const { occupants, includeTransport } = model.state;

  try {
    const costs = model.calculateCostPerHead(
      listing,
      occupants,
      includeTransport,
    );
    return { listing, occupants, includeTransport, costs };
  } catch (err) {
    return { listing, occupants, includeTransport, error: err.message };
  }
};

// CONTROLLERS

const resultsController = () => {
  searchView.renderCount(model.state.filtered.length);
  resultsView.render(model.state.filtered);
  resultsView.markSelected(model.state.selectedId);
};

const selectController = (id) => {
  model.setSelected(id);
  if (!model.getSelectedListing()) return;

  resultsView.markSelected(id);
  detailView.render(detailData());
};

const searchController = (term) => {
  model.setSearchTerm(term);
  resultsController();
};

const maxRentController = (value) => {
  model.setMaxRent(value);
  resultsController();
};

const occupantsController = (n) => {
  model.setOccupants(n);
  detailView.updateBreakdown(detailData());
};

const transportController = (on) => {
  model.setTransport(on);
  detailView.updateBreakdown(detailData());
};

const init = () => {
  searchView.addSearchHandler(searchController);
  searchView.addMaxRentHandler(maxRentController);
  searchView.addFormHandler();
  resultsView.addSelectHandler(selectController);
  detailView.addOccupantsHandler(occupantsController);
  detailView.addTransportHandler(transportController);

  resultsController();
};

init();