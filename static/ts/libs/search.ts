type SetResultsFunc = (resultsList: HTMLUListElement, allResults: string[], query: string) => void;

export class SearchBar {
    container: HTMLDivElement;
    searchInput: HTMLInputElement;
    resultsContainer: HTMLDivElement;
    resultsList: HTMLUListElement;
    allResults: string[];
    setResultsFunc: SetResultsFunc;

    constructor(container: HTMLDivElement, allResults: string[], setResultsFunc: SetResultsFunc) {
        this.container = container;
        this.searchInput = this._setSearchInput();
        this.resultsContainer = this._createResultsContainer();
        this.container.appendChild(this.resultsContainer);
        this.resultsContainer.appendChild(this._createResultsList());
        this.resultsList = this.resultsContainer.querySelector('ul') as HTMLUListElement;
        this.allResults = allResults;
        this.setResultsFunc = setResultsFunc;
        this._setListeners();
    }

    private _setSearchInput(): HTMLInputElement {
        const searchInput = this.container.querySelector('input');
        if (!searchInput) {
            throw new Error(`Input Element not found in ${this.container.id}`);
        }
        return searchInput;
    }

    private _createResultsContainer(): HTMLDivElement {
        const resultsContainer = document.createElement('div');
        resultsContainer.classList.add('search-results-container');
        resultsContainer.classList.add('hidden');
        const containerPosition = this.container.getBoundingClientRect();
        resultsContainer.style.top = `${containerPosition.bottom}px`;
        resultsContainer.style.left = `${containerPosition.left}px`;
        return resultsContainer;
    }

    private _createResultsList(): HTMLUListElement {
        const resultsList = document.createElement('ul');
        resultsList.classList.add('search-results-list');
        return resultsList;
    }

    private _setListeners(): void {
        this.searchInput.addEventListener('input', () => {
            const searchValue = this.searchInput.value.toLowerCase();
            if (searchValue) {
                this.resultsContainer.classList.remove('hidden');

            } else {
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