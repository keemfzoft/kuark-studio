export function App() {
    return (
        <div layout="workspace">
            <div curator="poly" glyph="avatar"></div>
        </div>
    );
}

kuark.getFiles('./').then(files => {
    console.log('Files:', files);
});