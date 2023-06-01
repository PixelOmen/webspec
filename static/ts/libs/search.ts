type SetResultsFunc = (resultsList: HTMLUListElement, allResults: string[], query: string) => void;

export class SearchBar {
    container: HTMLDivElement;
    searchInput: HTMLInputElement;
    resultsContainer: HTMLDivElement;
    resultsList: HTMLUListElement;
    allResults: string[];
    setResultsFunc: SetResultsFunc;
    inputFocus: boolean = false;
    resultsFocus: boolean = false;
    resultIndex: number = 0;
    currentSelection: HTMLLIElement | null = null;

    constructor(container: HTMLDivElement, allResults: string[], setResultsFunc: SetResultsFunc) {
        this.container = container;
        this.searchInput = this._setSearchInput();
        this.resultsContainer = this._createResultsContainer();
        this._moveResultsContainer();
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

    private _moveResultsContainer(): void {
        const containerPosition = this.container.getBoundingClientRect();
        this.resultsContainer.style.top = `${containerPosition.bottom}px`;
        this.resultsContainer.style.left = `${containerPosition.left}px`;
    }

    private _createResultsContainer(): HTMLDivElement {
        const resultsContainer = document.createElement('div');
        resultsContainer.classList.add('search-results-container');
        resultsContainer.classList.add('hidden');
        return resultsContainer;
    }

    private _createResultsList(): HTMLUListElement {
        const resultsList = document.createElement('ul');
        resultsList.classList.add('search-results-list');
        return resultsList;
    }

    private _keyDownHandler(e: KeyboardEvent): void {
        const results = this.resultsList.querySelectorAll('li');
        if (e.key != "ArrowDown" && e.key != "ArrowUp" && e.key != "Enter") {
            return;
        };
        if (results.length < 1) {
            this.resultsFocus = false;
            this.searchInput.focus();
            return;
        }
        this.resultsFocus = true;
        if (e.key == "ArrowDown") {
            e.preventDefault();
            if (this.resultIndex < results.length) {
                this.resultIndex++;
            }
        } else if (e.key == "ArrowUp") {
            e.preventDefault();
            if (this.resultIndex > 0) {
                this.resultIndex--;
            }
        } else {
            this.currentSelection?.click();
            return;
        }
        if (this.resultIndex > 0) {
            this.currentSelection = results[this.resultIndex - 1];
            this.currentSelection.focus();
            this.searchInput.value = this.currentSelection.innerHTML;
        } else {
            this.resultsFocus = false;
            this.searchInput.focus();
        }
    }

    private _setListeners(): void {
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
            } else {
                this.resultsContainer.classList.add('hidden');
            }
            this.setResultsFunc(this.resultsList, this.allResults, searchValue);
        });
        this.container.addEventListener('keydown', this._keyDownHandler.bind(this));
    }
}