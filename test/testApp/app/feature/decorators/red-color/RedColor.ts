module spa.feature.components {
    export class RedColor {

        link(value: any, element: HTMLElement) {
            //decorator linked to the HTML element
            element.style.color = 'red';
        }
    }
}