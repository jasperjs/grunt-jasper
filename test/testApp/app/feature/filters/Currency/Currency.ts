module spa.feature.filters {
    // you can use this filter like: {{ someExpression | currency }}
    export class Currency {
        static $inject = [];

        constructor() {
            return (source: any) => {
                return '$' + source;
            }
        }

    }
}