let testFlag = false;

export function runTest() {
    console.log("Testing");
    testFlag = true;

    self.postMessage({
        action: "repaint",
        glyph: "avatar",
    });
}

export function Shelf() {
    return (
        <div layout="shelf" motion="fade-in-up">
            <div aesthetic="box"></div>
            <div aesthetic="box"></div>
            <div aesthetic="box"></div>
            <div aesthetic="box"></div>
        </div>
    );
}

export function Avatar() {
    console.log(testFlag);

    return (
        <>
            {testFlag && <Shelf />}
            <div aesthetic="avatar" motion="bounce" curate="poly" onClick="runTest">
                <img source="/assets/images/robot-face.png" />
            </div>
        </>
    );
}