export { NotificationMsg };
class Notification {
    constructor() {
        this.container = this.createContainer();
        this.blur = this.createBlur();
        this.message = document.createElement('p');
        this.container.append(this.message);
    }
    createContainer() {
        const container = document.createElement('div');
        container.classList.add('notification-container');
        return container;
    }
    createBlur() {
        const blur = document.createElement('div');
        blur.classList.add('notification-blur');
        return blur;
    }
}
class NotificationMsg extends Notification {
    constructor(closefunc, btnLabel) {
        super();
        this.closefunc = closefunc;
        this.btnLabel = btnLabel;
    }
    createCloseBtn(btnlabel) {
        const closeBtn = document.createElement('button');
        closeBtn.classList.add("notification-btn");
        closeBtn.innerHTML = btnlabel ? btnlabel : 'Close';
        return closeBtn;
    }
    setCloseBtn(closeBtn, closefunc) {
        closeBtn.addEventListener('click', () => {
            const body = document.querySelector('body');
            body.removeChild(this.container);
            body.removeChild(this.blur);
            closefunc === null || closefunc === void 0 ? void 0 : closefunc();
        });
    }
    displayNotification(msg) {
        const body = document.querySelector('body');
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
