export class SearchBar {
    constructor(container, allResults, setResultsFunc) {
        this.container = container;
        this.searchInput = this._setSearchInput();
        this.resultsContainer = this._createResultsContainer();
        this.container.appendChild(this.resultsContainer);
        this.resultsContainer.appendChild(this._createResultsList());
        this.resultsList = this.resultsContainer.querySelector('ul');
        this.allResults = allResults;
        this.setResultsFunc = setResultsFunc;
        this._setListeners();
    }
    _setSearchInput() {
        const searchInput = this.container.querySelector('input');
        if (!searchInput) {
            throw new Error(`Input Element not found in ${this.container.id}`);
        }
        return searchInput;
    }
    _createResultsContainer() {
        const resultsContainer = document.createElement('div');
        resultsContainer.classList.add('search-results-container');
        resultsContainer.classList.add('hidden');
        const containerPosition = this.container.getBoundingClientRect();
        resultsContainer.style.top = `${containerPosition.bottom}px`;
        resultsContainer.style.left = `${containerPosition.left}px`;
        return resultsContainer;
    }
    _createResultsList() {
        const resultsList = document.createElement('ul');
        resultsList.classList.add('search-results-list');
        return resultsList;
    }
    _setListeners() {
        this.searchInput.addEventListener('input', () => {
            const searchValue = this.searchInput.value.toLowerCase();
            if (searchValue) {
                this.resultsContainer.classList.remove('hidden');
            }
            else {
                this.resultsContainer.classList.add('hidden');
            }
            this.setResultsFunc(this.resultsList, this.allResults, searchValue);
        });
        this.searchInput.addEventListener('focusout', () => {
            setTimeout(() => {
                this.resultsContainer.classList.add('hidden');
            }, 100);
        });
    }
}
// const arrowFunc = (e: KeyboardEvent) => {
//     if (e.key == "ArrowDown") {
//         const firstResult = ELEMENTS.searchResultList.firstElementChild as HTMLLIElement;
//         firstResult.focus();
//         e.preventDefault();
//     } else if (e.key == "ArrowUp") {
//         const lastResult = ELEMENTS.searchResultList.lastElementChild as HTMLLIElement;
//         lastResult.focus();
//         e.preventDefault();
//     }
// }
