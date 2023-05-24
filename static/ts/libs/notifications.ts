export { NotificationMsg };

abstract class Notification {
    protected container: HTMLDivElement;
    protected blur: HTMLDivElement
    protected message: HTMLParagraphElement;

    constructor () {
        this.container = this.createContainer();
        this.blur = this.createBlur();
        this.message = document.createElement('p');
        this.container.append(this.message);
    }

    private createContainer(): HTMLDivElement {
        const container = document.createElement('div');
        container.classList.add('notification-container');
        return container;
    }

    private createBlur(): HTMLDivElement {
        const blur = document.createElement('div');
        blur.classList.add('notification-blur');
        return blur;
    }
}

class NotificationMsg extends Notification {
    private closefunc?: () => void;
    private btnLabel?: string;
    
    constructor (closefunc?: () => void, btnLabel?: string) {
        super();
        this.closefunc = closefunc;
        this.btnLabel = btnLabel;
    }

    private createCloseBtn(btnlabel?: string): HTMLButtonElement {
        const closeBtn = document.createElement('button');
        closeBtn.classList.add("notification-btn");
        closeBtn.innerHTML = btnlabel ? btnlabel : 'Close';
        return closeBtn;
    }
    
    private setCloseBtn(closeBtn: HTMLButtonElement, closefunc?: () => void) {
        closeBtn.addEventListener('click', () => {
            const body = document.querySelector('body') as HTMLBodyElement;
            body.removeChild(this.container);
            body.removeChild(this.blur);
            closefunc?.();
        });
    }

    displayNotification(msg: string) {
        const body = document.querySelector('body') as HTMLBodyElement;
        body.appendChild(this.container);
        body.appendChild(this.blur);
        this.message.innerHTML = msg;
        this.container.append(document.createElement('br'));
        const closebtn = this.createCloseBtn(this.btnLabel);
        this.container.appendChild(closebtn);
        this.setCloseBtn(closebtn, this.closefunc);
        closebtn.focus();
    }
}