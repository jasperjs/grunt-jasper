module spa.core.decorators {
    export class FocusOnDefault {

        link(value: any, element: HTMLInputElement) {
            if (!value) return;
            setTimeout(() => {
                element.focus();
            }, 20);
        }
    }
}