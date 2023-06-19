export class SearchBar {
    constructor(container, allResults, setResultsFunc) {
        this.resultIndex = 0;
        this.currentSelection = null;
        this.container = container;
        this.searchInput = this._setSearchInput();
        this.resultsContainer = this._createResultsContainer();
        this.container.appendChild(this.resultsContainer);
        this.resultsContainer.appendChild(this._createResultsList());
        this.resultsList = this.resultsContainer.querySelector('ul');
        this.allResults = allResults;
        this.setResultsFunc = setResultsFunc;
        this._setListeners();
        // this._moveResultsContainer();
    }
    _setSearchInput() {
        const searchInput = this.container.querySelector('input');
        if (!searchInput) {
            throw new Error(`Input Element not found in ${this.container.id}`);
        }
        return searchInput;
    }
    _moveResultsContainer() {
        const containerPosition = this.container.getBoundingClientRect();
        this.resultsContainer.style.top = `${containerPosition.bottom}px`;
        this.resultsContainer.style.left = `${containerPosition.left}px`;
    }
    _createResultsContainer() {
        const resultsContainer = document.createElement('div');
        resultsContainer.classList.add('search-results-container');
        resultsContainer.classList.add('hidden');
        return resultsContainer;
    }
    _createResultsList() {
        const resultsList = document.createElement('ul');
        resultsList.classList.add('search-results-list');
        return resultsList;
    }
    _keyDownHandler(e) {
        var _a;
        const results = this.resultsList.querySelectorAll('li');
        if (e.key != "ArrowDown" && e.key != "ArrowUp" && e.key != "Enter") {
            return;
        }
        ;
        if (results.length < 1) {
            this.searchInput.focus();
            return;
        }
        if (e.key == "ArrowDown") {
            e.preventDefault();
            if (this.resultIndex < results.length) {
                this.resultIndex++;
            }
        }
        else if (e.key == "ArrowUp") {
            e.preventDefault();
            if (this.resultIndex > 0) {
                this.resultIndex--;
            }
        }
        else {
            (_a = this.currentSelection) === null || _a === void 0 ? void 0 : _a.click();
            return;
        }
        if (this.resultIndex > 0) {
            this.currentSelection = results[this.resultIndex - 1];
            this.currentSelection.focus();
            this.searchInput.value = this.currentSelection.innerHTML;
        }
        else {
            this.searchInput.focus();
        }
    }
    _setListeners() {
        window.addEventListener('resize', this._moveResultsContainer.bind(this));
        this.container.addEventListener('focusout', () => {
            setTimeout(() => {
                if (this.container.contains(document.activeElement)) {
                    return;
                }
                this.resultsContainer.classList.add('hidden');
                this.currentSelection = null;
            }, 100);
        });
        this.searchInput.addEventListener('input', () => {
            this.currentSelection = null;
            this.resultIndex = 0;
            const searchValue = this.searchInput.value.toLowerCase();
            if (searchValue) {
                this.resultsContainer.classList.remove('hidden');
            }
            else {
                this.resultsContainer.classList.add('hidden');
            }
            this.setResultsFunc(this.resultsList, this.allResults, searchValue);
        });
        this.container.addEventListener('keydown', this._keyDownHandler.bind(this));
    }
}
