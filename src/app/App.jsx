export function App() {
    return (
        <div layout="fullscreen">Kuark Studio</div>
    );
}

window.kuark.getFiles('./').then(files => {
    console.log('Files:', files);
});