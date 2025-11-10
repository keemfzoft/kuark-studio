export function App() {
    return (
        <div layout="fullscreen">
            <span>Kuark Studio</span>
            <div aesthetic="avatar" motion="bounce">
                <img source="/assets/images/robot-face.png" />
            </div>
        </div>
    );
}

kuark.getFiles('./').then(files => {
    console.log('Files:', files);
});