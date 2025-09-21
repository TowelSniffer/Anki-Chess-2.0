export function waitForElement<T extends Element>(selector: string): Promise<T> {
    return new Promise(resolve => {
        const element = document.querySelector<T>(selector);
        if (element) {
            return resolve(element);
        }
        const observer = new MutationObserver(() => {
            const element = document.querySelector<T>(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}
