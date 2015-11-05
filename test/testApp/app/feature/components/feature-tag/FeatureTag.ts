module spa.feature.components {
    export class FeatureTag {
        static $inject = [];

        title = 'feature-tag';

        initializeComponent() {
            // place your initialize logic here
        }


        disposeComponent() {
            console.log('disposed tag');
        }


    }
}