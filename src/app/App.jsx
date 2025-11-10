export function App() {
    return (
        <div layout="fullscreen">Kuark Studio</div>
    );
}

kuark.getFiles('./').then(files => {
    console.log('Files:', files);
});