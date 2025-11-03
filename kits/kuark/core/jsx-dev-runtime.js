function createGlyph(type, props, key) {
    return {
        class: "kuark.glyph",
        type,
        props,
        key,
    };
}

// Required exports for JSX transform
export function jsxDEV(type, props, key) {
    return createGlyph(type, props, key);
}

export function jsxsDEV(type, props, key) {
    return createGlyph(type, props, key);
}

// Fragment support: just a marker for grouping
export const Fragment = "kuark.fragment";