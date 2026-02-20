export function App() {
    return (
        <div layout="fullscreen" aesthetic="workspace">
            <div aesthetic="avatar" motion="bounce">
                <img source="/assets/images/robot-face.png" />
                <div id="editor" layout="fullscreen"></div>
            </div>
        </div>
    );
}

kuark.getFiles('./').then(files => {
    console.log('Files:', files);
});